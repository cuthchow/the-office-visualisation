 
        //Have to use the .then() async style since D3 v5
        //This line gets the data from csv asynchronously
        //The function (in the 2nd arg) preprocesses the data, converting numbers into floats
        //After promise resolves, data is stored in global variable named dataset
        //All functions using that data are run in the .then() to ensure the data is available

        let dataset 
        //Secondary dataset for the row labels for each episode 
        let episode = [
            {episode: 'S1 Episode 1', episodenum: 1},
            {episode: 'S1 Episode 2', episodenum: 2},
            {episode: 'S1 Episode 3', episodenum: 3},
            {episode: 'S1 Episode 4', episodenum: 4},
            {episode: 'S1 Episode 5', episodenum: 5},
            {episode: 'S1 Episode 6', episodenum: 6}
        ]

        let sizeScale, sentScale, episodeScale, episodeScale2, charScale, force, nodes, sceneScale

        let margin = {top: 80, left: 130, bottom: 80, right: 80}
        let width = 1700 - margin.left - margin.right
        let height = 800 - margin.top - margin.bottom

        //Function converts numbers from strings into floats
        d3.csv('test.csv', function(d){
            return {
                season: +d.season,
                episode: +d.episode,
                scene: +d.scene,
                text: d.line_text,
                speaker: d.speaker,
                sentiment: +d.sentiment,
                length: +d.length,
                deleted: d.deleted,
                radius: +d.length
            };
        }).then(data => {
            dataset = data
            draw()
        })

        function initialForce(){
            //Force simulation
            force = d3.forceSimulation(dataset)
                    .alpha([0.6])
                    .alphaMin([0.0005])
                    .alphaTarget([0.001])
                    .alphaDecay([0.1])
                    .force('charge', d3.forceManyBody().strength([-5]))
                    .force('collide', d3.forceCollide(d => sizeScale(d.radius) + 2).strength([2]).iterations([5]))
                    .force('forceX', d3.forceX(d => episodeScale2(d.episode) + sceneScale(d.scene)).strength([.8]))
                    .force('forceY', d3.forceY([400]).strength([.2]))

            force.on('tick', () => {
                nodes.attr('cx', d => d.x)
                    .attr('cy', d => d.y)
            })
        }

        //Draw function called when data is loaded
        function draw(){
            // INITIALISATION OF SCALES //
            sizeScale = d3.scaleLinear(d3.extent(dataset, d => d.length), [5, 14])
            sentScale = d3.scaleLinear(d3.extent(dataset, d => d.sentiment), [margin.left, margin.left + width])
            episodeScale = d3.scaleLinear([1, 6], [margin.top, height])
            episodeScale2 = d3.scaleBand([1, 2,3,4,5,6], [margin.left, width])
            sceneScale = d3.scaleLinear([1, 40], [0, episodeScale2.bandwidth()])
            charScale = d3.scaleOrdinal([1, 2, 3, 4, 5, 6], d3['schemeSet1'])

            initialForce()

            //Drawing each line as a node
            nodes = d3.select('svg').selectAll('circle')
                .data(dataset).enter()
                .append('circle')
                    .attr('cx', 200)
                    .attr('cy', 200)
                    .attr('r', d => sizeScale(d.length))
                    .attr('fill', d => {
                            if (d.deleted === "TRUE"){
                                return 'grey'
                            } else {
                                return charScale(d.speaker)
                            }
                        })
                    .attr('opacity', d => {
                        return d.deleted === "TRUE" ? 0.3 : 0.8
                    })
                    .call(d3.drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended))
                    .on('mouseover', function(d, i){
                        // SCOPE OF 'THIS' IN FUNCTION(D) AND (D) => ARE DIFFERENT
                        let xPosition = d.x + 45
                        let yPosition = d.y + 0
                        d3.select(this)
                            .attr('r', 14)
                        let tooltip = d3.select('#tooltip')
                            .style('left', xPosition + 'px' )
                            .style('top', yPosition + 'px' )
                            .classed('hidden', false)
                        
                        tooltip.select('#quotemeta').text(`Scene ${d.scene} of Episode ${d.episode}`)
                        tooltip.select('#quote').text(`"${d.text}" - ${d.speaker}`)
                        tooltip.select('img').attr('src', `https://github.com/cuthchow/the-office-visualisation/tree/master/img/{d.speaker}.png`)
                                            .attr('border', `2px solid ${charScale(d.speaker)}`)
                    })
                    .on('mouseout', function(d) {
                        d3.select('#tooltip').classed('hidden', true);
                        //Seems like 'this' refers to the DOM element, and d refers to the data point
                        d3.select(this)
                            .attr('r', sizeScale(d.length))
                    })

                    function dragstarted(d) {
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(d) {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                    }

                    function dragended(d) {
                        d.fx = null;
                        d.fy = null;
                        force.alpha([0.01])
                    }
            
            let xAxis = d3.axisBottom()

            xAxis.scale(episodeScale2)
            d3.select('svg').append('g').attr('transform', 'translate(0, 100)').call(xAxis)
        }


        // Transition into new formation
        function changeForces(){
            force
                .restart()
                .alpha([0.6])
                .force('forceX', d3.forceX(d => sentScale(d.sentiment)).strength([.3]))
                .force('forceY', d3.forceY(d => episodeScale(d.episode)).strength([.3]))
            
            //Lable each episode using the episode dataset
            d3.select('svg').selectAll('text').data(episode).enter()
                .append('text').transition().duration(1300)
                .text(d =>  `${d.episode}`)
                .attr('y', d => episodeScale(d.episodenum))

            let xAxis = d3.axisTop()
            .tickSize(height)
            xAxis.scale(sentScale);

            d3.select('svg').append('g')
                .attr('transform', `translate(0, ${height + 50})`)
                .call(xAxis)
            
            let svg = d3.select('svg');

        }            

        
        function barChart(){
            force.stop()

            let barData = d3.nest()
                            .key(d => d.speaker)
                            .rollup(v => v.length)
                            .entries(dataset)
            
            console.log(barData)
        }

        function clusterByCharacter(){
            
        }


        
