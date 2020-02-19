 
        //Have to use the .then() async style since D3 v5
        //This line gets the data from csv asynchronously
        //The function (in the 2nd arg) preprocesses the data, converting numbers into floats
        //After promise resolves, data is stored in global variable named dataset
        //All functions using that data are run in the .then() to ensure the data is available

        let dataset2, sentScale, rowBySent, xAxis, yAxis, meanSent, colorScale, rowByName
        

        const colors2 = chroma.scale([red, blue, green])

        const margin = {top: 40, left: 100, right: 100, bottom: 40}
        const width = 1000 - margin.left - margin.right
        const height = 1000 - margin.top - margin.bottom

        const rowPos = Array.from({length: 19}, (x, i) => (i+1) * 40 + 20)
        let people = ['Jim', 'Michael', 'Dwight', 'Pam', 'Angela', 'Jan', 'Oscar', 'Phyllis', 'Stanley', 'Darryl', 'David', 'Kelly', 'Ryan', 'Meredith', 'Creed', 'Roy', 'Kevin', 'Toby', 'Erin']

        const ttwidth = 100
        let lineData = []


        //Function converts numbers from strings into floats
        d3.csv('sentiments.csv', function(d){
            return {
                season: d.season,
                speaker: d.speaker,
                sentiment: +d.sentiment
            };
        }).then(data => {
            dataset2 = data.filter(d => people.includes(d.speaker))
            initialise()
            annotate()
        })

        //Sets the initial order of the people array (in order of total sentiment)
        function initialise(){
            function asc(a,b){
                return a.sentiment < b.sentiment ? -1 : a.sentiment > b.sentiment ? 1 : a.sentiment >= b.sentiment ? 0 : NaN;
            }
            people = []
            dataset2.filter(d => d.season == "all").sort(asc).forEach(d => people.push(d.speaker))

            people.forEach(p => {
                let temp = dataset2.filter(d => d.speaker == p)
                let maxSent = d3.max(temp, d=> d.sentiment)
                let minSent = d3.min(temp, d=> d.sentiment)
                lineData.push({speaker: p, minSent: minSent, maxSent: maxSent})
            })
            
            colorScale = d3.scaleLinear(d3.extent(dataset2, d => d.sentiment), [-0.2,1.5])

            drawBase()
            drawLines()
        }

        //Draws the initial circles (without position)
        function drawBase(){
            sentScale = d3.scaleLinear(d3.extent(dataset2, d => d.sentiment), [margin.left, margin.left + width])

            d3.select('#sentiment_lines').selectAll('circle').data(dataset2).enter()
                .append('circle')
                    .attr('fill', d => {
                        if (d.season == "all" & people.includes(d.speaker)){
                            return '#ED0026'
                        } else if (people.includes(d.speaker)) {
                            return colors2(colorScale(d.sentiment))
                        } 
                    })
                    .attr('r', d => {
                        if (d.season == "all"){
                            return 12
                        }
                        return 9
                    })
                    .attr('opacity', 0.7)
            
            sortBySent()
        }

        //Moves the circles based on sentiment
        function sortBySent(){
            function asc(a,b){
                return a.sentiment < b.sentiment ? -1 : a.sentiment > b.sentiment ? 1 : a.sentiment >= b.sentiment ? 0 : NaN;
            }
            people =[]
            dataset2.filter(d => d.season == "all").sort(asc).forEach(d => people.push(d.speaker))

            rowBySent = d3.scaleOrdinal(people, rowPos)

            let svg = d3.select('#sentiment_lines')
            let selection = d3.select('#sentiment_lines').selectAll('circle')
            
            selection
                .transition().duration(800).ease(d3.easeElastic)
                    .attr('cx', d => sentScale(d.sentiment))
                    .attr('cy', d => rowBySent(d.speaker))

            tooltip2(selection, rowBySent)
                .append('title').text(d => d.speaker)

            createAxes(rowBySent)
            horizontalLines(rowBySent)

            d3.select('#b3').classed('selected_button', false)
            d3.select('#b2').classed('selected_button', true)
        }


        //Creates the axes
        function createAxes(scale){
            xAxis = d3.axisBottom()
            xAxis.scale(sentScale)
                .ticks(5) 
                .tickSize(height - 200)
            
            yAxis = d3.axisRight()
            yAxis.scale(scale)
                .tickSize(0)

            d3.select('#sentiment_lines').select('g')
            .call(yAxis)
                .call(g => g.select('.domain').remove())
                .transition().duration(400)
                    .attr('transform', 'translate(0, 0)')
        }

        //Draws the axes and reference lines
        function drawLines() {

            meanSent = d3.mean(dataset2, d => d.sentiment)

            let refCoords = [
                {x: sentScale(meanSent), y: 30}, 
                {x: sentScale(meanSent), y: 850}
            ]

            let reference = d3.line()
                .x(d => d.x)
                .y(d => d.y)

            let svg = d3.select('#sentiment_lines')  
            
            // svg.append('g').call(xAxis)
            //     .call(g => g.select('.domain').remove())
            //     .call(g => g.selectAll('.tick line'))
            //         .attr('stroke-opacity', 0.5)
            //         .attr('stroke-dasharray', '2.2')
           
            svg.append('g')
                .style('font', '18px monospace')
                .call(yAxis).attr('transform', 'translate(0, 0)')
                    .call(g => g.select('.domain').remove())
            
            svg.append('path')
                .datum(refCoords)
                .attr('class', 'meanline')
                .attr('d', reference)
                .attr('stroke-dasharray', '5.2')
        }

        //Draw horizontal lines based on given scale (sentiment or name)
        function horizontalLines(scale){
            let svg = d3.select('#sentiment_lines')

            svg.selectAll('path').data(lineData).enter()
            svg.selectAll('.line').remove()

            line = d3.line()
                .x(d => sentScale(d.sentiment))
                .y(d => scale(d.speaker));

            for (var i = 0; i < people.length; i++){
                svg.append('path')
                    .datum(dataset2.filter(d => d.speaker == people[i]))
                    .attr('class', 'line')
                    .attr('d', line)
            } 
        }

        //Creates tooltips based on given scale (sentiment or name)
        function tooltip2(selection, scale){
            return selection
                .on('mouseover', function(d) {
                    let posX = sentScale(d.sentiment)
                    let posY = scale(d.speaker)

                    d3.select('.tooltip')
                        .style('left', (d3.event.pageX + 10)+'px')
                        .style('top', (d3.event.pageY - 25) + 'px')
                        .style('display', 'inline-block')
                        .html(`Speaker: ${d.speaker} <br> Season: ${d.season}`)

                    d3.select(this)
                        .transition().duration(400)
                            .attr('r', 14)
                            .attr('stroke', 'black')
                            .attr('stroke-width', '2')
                })
                .on('mouseout', function(d){
                    d3.select('.tooltip')
                        .style('display', 'none')
                    d3.select(this)
                        .transition()
                        .attr('r', d => {
                            return d.season == 'all'? 12 : 9
                        })
                        .attr('stroke-width', '0')
                })
        }

        //Annotate graph
        function annotate(){
            let svg = d3.select('#sentiment_lines')

            svg.append('text')
                .attr('x', sentScale(meanSent) +50)
                .attr('y', 20)
                .text('Above Avg. ->')
                .attr('font-size', '20px')
                .attr('font-family', 'monospace')
                .attr('fill', 'grey')

            svg.append('text')
                .attr('x', sentScale(meanSent) -190)
                .attr('y', 20)
                .text('<- Below Avg.')
                .attr('font-size', '20px')
                .attr('font-family', 'monospace')
                .attr('fill', 'grey')

            svg.append('text')
                .attr('x', sentScale(meanSent) + 10)
                .attr('y', '850')
                .attr('font-size', '20px')
                .attr('font-family', 'monospace')
                .text('Average Sentiment Score')
                .attr('fill', 'grey')
        }

        //Moves the circles to rows based on name order
        function sortByName(){
            people = []
            dataset2
                .filter(d => d.season == "all")
                .sort((a, b) => a.speaker > b.speaker ? 1 : -1)
                .forEach(d => people.push(d.speaker))

            rowByName = d3.scaleOrdinal(people, rowPos)
            
            createAxes(rowByName)
            horizontalLines(rowByName)

            let selection = d3.select('#sentiment_lines').selectAll('circle')
            
            tooltip2(selection, rowByName) // this returns a selection
                .transition().duration(800).ease(d3.easeElastic)
                    .attr('cy', d => rowByName(d.speaker))

            d3.select('#b3').classed('selected_button', true)
            d3.select('#b2').classed('selected_button', false)
        }
       

        //Each Changes:
        // 1. Update the people array to the new order
        // 2. create a new scale for the rows using that new people array
        // 3. use createAxes using the new scale (creates the axis, and calls it using the svg -> group)
        // 4. update horizontal lines using new scale
        // 5. Update all circles, using the selection, passing it into tooltip, and using the result and changing 'cy'
        // 6. Change interface button 