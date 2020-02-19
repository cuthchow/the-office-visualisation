let dataset3, svg3, arcgen, angleScale3, radiusScale3, andy, colors3

const max_rad = 110;
const slice_padding = 0.01;

d3.csv('word_counts.csv', function(d){
    return {
        speaker: d.speaker,
        words: +d.words,
        season: +d.season
    };
}).then(data => {
    dataset3 = d3.nest().key(d => d.speaker).entries(data)
    small_multiples()
    setInterval(small_multiples, 8000)
})


function small_multiples(){

    d3.select('#small_multiples').selectAll('g').remove()
    // andy = dataset3[20].values
    // let speaker = andy[0].speaker

    angleScale3 = d3.scaleLinear([1,10], [0, Math.PI * 2])
    radiusScale3 = d3.scaleLinear([0, 35000], [60, max_rad])
    colorScale3 = d3.scaleLinear([0, 5000], [0,1])
    chroma3 = chroma.scale([red, blue, green]).mode('lrgb').domain([0, 0.2, 1])
    colors3 = d3.scaleSequential(chroma3).domain([0,5000])

    arcGen = d3.arc()
        .innerRadius(35)
        .outerRadius((d, i) => radiusScale3(d.words))
        .startAngle((d, i) => angleScale3(d.season) + slice_padding)
        .endAngle((d, i) => angleScale3(d.season + 1) - slice_padding)

    d3.select('#small_multiples').append('g').attr('transform', 'translate(600, 500)')
    svg3 = d3.select('#small_multiples').select('g')

    // d3.select('#small_multiples').select('g').append('g')
    //     .attr('class', 'legendQuant')
    //     .attr('transform', 'translate(100, 500)')

    // let legend = d3.legendColor()
    //     .title('Colour Legend')
    //     .titleWidth(100)
    //     .scale(colors3)

    // svg3.select('.legendQuant')
    //     .call(legend)

    svg3 = svg3.selectAll('g').data(dataset3).enter()
        .append('svg:g')
        .attr('width', 250)
        .attr('height', 250)
        .attr('transform', customTransform)
    
    svg3.selectAll('path')
        .data(d => d.values)
        .enter()
        .append('path')
            .on('mouseover', multiples_mouseover)
            .on('mouseout', hideTooltip)
            .transition().delay((d, i) => d.season * 150)
            .attr('fill', d => colors3(d.words))
            .attr('d', arcGen)
    
    svg3.selectAll('text')
        .data(d => d.values)
        .enter()
        .append('text')
        .text((d, i) => i == 0 ? d.speaker : '')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14')

}

function multiples_mouseover(d, i){
        d3.select(this)
            .attr('opacity', 0.7)
            .attr('stroke-width', 3)
            .attr('stroke', 'black')

        d3.select('.tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`Speaker: ${d.speaker} <br> Season: ${d.season} <br>Word Count: ${d.words}`)
    }

function hideTooltip(){
    tooltip.style('display', 'none')

    d3.select(this)
        .attr('opacity', 1)
        .attr('stroke-width', 0)
}

function customTransform(d, i){
    let index = i 
    let col = index % 6
    let row = Math.floor(index / 6)
    return `translate(${col*200 - 500}, ${row * 200 - 400})`
}