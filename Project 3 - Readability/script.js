 
        //Have to use the .then() async style since D3 v5
        //This line gets the data from csv asynchronously
        //The function (in the 2nd arg) preprocesses the data, converting numbers into floats
        //After promise resolves, data is stored in global variable named dataset
        //All functions using that data are run in the .then() to ensure the data is available

        // let dataset, sentScale, rowBySent, xAxis, yAxis, meanSent, colorScale
        


        // //Function converts numbers from strings into floats
        // d3.csv('sentiments.csv', function(d){
        //     return {
        //         season: d.season,
        //         speaker: d.speaker,
        //         sentiment: +d.sentiment
        //     };
        // }).then(data => {
        //     dataset = data.filter(d => people.includes(d.speaker))
        // })

        dataset = [
            {name: "Michael", value: 100},
            {name: "Pam", value: 200},
            {name: "Jim", value: 300}
        ]

        arc= d3.arc()
            .innerRadius((d, i) => i * 50)
            .outerRadius((d, i) => i * 100)

        let w = 500
        let h = 500
        
        let dataset2 = [5, 10, 15, 20, 25];
        
        function thing(){
            d3.select('body').selectAll('div')
                .data(dataset2)
                .enter()
                .append('div')
                .attr('class', 'bar')

            let svg = d3.select('body')
                .append('svg')
                .attr('width', w)
                .attr('height', h);

            svg.append('text').text("YO")
            
            svg.selectAll('path')
                .data(dataset).enter().append('path')
                    .attr('d', arc)
                    .attr('fill', 'red')   
        }

        thing()
        