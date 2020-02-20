        // let dataset, sentScale, rowBySent, xAxis, yAxis, meanSent, colorScale
        
        let dataset, angleScale, colors, ticks, tooltip

        const red = '#eb6a5b'
        const blue = '#52b6ca'
        const green = '#b6e86f'

        //Function converts numbers from strings into floats
        d3.csv('grade_scores.csv', function(d){
            return {
                speaker: d.speaker,
                score: +d.score
            };
        }).then(data => {
            dataset = data
            tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip');
        })

        let w = 1400
        let h = 1000

        function run() { 
            d3.select('#b1')
                .classed('selected_button', true)

            angleScale = d3.scaleLinear(/*d3.extent(dataset, d => d.score)*/[0, 4.5], [0, 2 * Math.PI])
            colors = chroma.scale([green, blue, red]).colors(25)

            arc= d3.arc()
                .innerRadius((d, i) => 436 - i * 15)
                .outerRadius((d, i) => 450 - i * 15)
                .startAngle(0)
                .endAngle((d, i) => angleScale(d.score))

            d3.select('#radial_bar').selectAll('g').remove()

            let svg = d3.select('body')
                .select('#radial_bar')
                .attr('width', w)
                .attr('height', h)
                .attr('stroke', 'black')

            let radialAxis = svg.append('g')
            .selectAll('g')
                .data(dataset)
                .enter().append('g')
                .attr('class', 'axis');
            
            radialAxis.append('circle')
                .attr('transform', 'translate(700, 500)')
                .attr('r', (d, i) => 450 - i * 15)
                .attr('display', (d, i) => i % 3 == 0 ? 'block' : 'none')
                .attr('opacity', 0.3)

            radialAxis.append('text')
                .attr('x', -70)
                .attr('y', (d, i) => -(450 - i * 15)+10)
                .attr('class', 'speaker')
                .text(d => d.speaker)
                .attr('font-family', 'monospace')
                .transition().delay((d, i) => i * 100)
                    .attr('transform', 'translate(700, 500)')
                    .attr('font-size', '14')

            ticks = angleScale.ticks(9).slice(0, -1)
            
            let axialAxis = svg.append('g')
                .attr('transform', 'translate(700, 500)')
                .attr('class', 'axial axis')
                .selectAll('g')
                    .data(ticks)
                    .enter().append('g')        
                        .attr('transform', d=> `rotate(${rad2deg(angleScale(d)) - 90})`)

            axialAxis.append('line')
                .attr('x2', 450)
                .attr('opacity', 0.3)
        
            let arcs = d3.select('svg').append('g').attr('transform', 'translate(700, 500)')
                .selectAll('path')
                .data(dataset)
                .enter()
                .append('path')
                    .attr('fill', 'black')
                    .attr('class', 'bar')
               
            arcs.on('mousemove', showTooltip)
            arcs.on('mouseout', hideTooltip)

            arcs.transition()
                    .delay((d, i) => i * 100)
                    .duration(700)
                        .attr('d', arc)
                        .attr('fill', (d, i) => colors[i])  
                        .attr('stroke-width', 0)

            
            function arcTween(d, i) {
                let interpolate = d3.interpolate(0, d.score);
                return t => arc(interpolate(t), i)
            }

            function showTooltip(d){
                tooltip
                    .style('left', (d3.event.pageX + 10)+'px')
                    .style('top', (d3.event.pageY - 25) + 'px')
                    .style('display', 'inline-block')
                    .html(`Character: ${d.speaker} <br> Spoken grade level: Grade ${d.score}`)
            }

            function hideTooltip(){
                tooltip.style('display', 'none')
            }

            
        }

        function rad2deg(angle){
            return angle * 180 / Math.PI
        }
        