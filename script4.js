let dataset4, subdataset4, sceneScale, episodeScale, seasonScale, sentScale4
let active_person = 'Everyone'
let colors4

d3.csv('the-office-lines-clean.csv', function(d){
    return {
        speaker: d.speaker,
        words: +d.length,
        season: +d.season, 
        scene: +d.scene,
        episode: +d.episode,
        line_text: d.line_text,
        deleted: d.deleted, 
        sentiment: +d.sentiment,
        counter: +d.counter
    };
}).then(data => {
    dataset4 = data.filter(d => d.deleted == "False");
    scatter_init()
    filterSeason('1')
})

function scatter_init(){
    colors4 = chroma.scale([red, blue, green])
    svg4 = d3.select('#scatterplot').append('svg')

    sceneScale = d3.scaleLinear([1, 65], [10, 1800])
    episodeScale = d3.scaleLinear([1, 28], [50, 1000])
    // seasonScale = d3.scaleLinear([1, 9], [10, 2400])
    sentScale4 = d3.scaleLinear([-0.5, 0.5], [0, 1])
    counterScale4 = d3.scaleLinear([1, 10], [0, 50])
}

function make_scatter(){
    svg4.selectAll('circle').remove()

    let numEps = episodeScale(d3.extent(subdataset4, d => d.episode)[1])
    d3.select('#scatterplot').style('height', numEps + 50)

    svg4.call(d3.zoom().scaleExtent([1, 4]).on('zoom', () => g.attr('transform', d3.event.transform)))
    svg4.attr('viewBox', [0, 0, 1400, numEps + 50])

    g = svg4.selectAll('circle').data(subdataset4).enter()
        .append('circle')
    
    g.transition().delay((d, i) => i / 10).duration(500)
        .attr('cx', (d, i) => sceneScale(d.scene) + counterScale4(d.counter))
        .attr('cy', d => episodeScale(d.episode))
        .attr('r', 3)
        .attr('opacity', 0.7)
        .attr('fill', (d, i) => colors4(sentScale4(d.sentiment)))
        
    svg4
        .append('text').text('hi')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fontsize', 50)
        .attr('fill', 'black')
    
    svg4.selectAll('circle')
        .on('mouseover', scatterMouseOver)
        .on('mouseout', hideTooltip)

    svg4.selectAll('text')
        .data(subdataset4)
        .enter()
        .append('text')
        .text((d, i) => i == 0 ? d.speaker : '')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14')
}






function scatterMouseOver(d, i){
    d3.select(this)
            .attr('opacity', 0.7)
            .attr('stroke-width', 2)
            .attr('stroke', 'black')

    d3.select('.tooltip')
        .style('left', (d3.event.pageX + 10)+ 'px')
        .style('top', (d3.event.pageY - 25) + 'px')
        .style('display', 'inline-block')
        .html(`Character: ${d.speaker} <br> Line: ${d.line_text} <br> Episode: S${d.season}, E${d.episode}<br>Sentiment: ${d.sentiment}`)
}


function filterPerson(person){
    active_person = person
    svg4.selectAll('circle')
        .transition().duration(500).delay((d, i)=> i/10 + 500)
        .attr('fill', d => {
            if (active_person != "Everyone") {
                return d.speaker == active_person ? 'red' : 'grey'
            } else {
                return colors4(sentScale4(d.sentiment))
            }
        })
}

function filterSeason(season){
    season = +season 
    subdataset4 = dataset4.filter(d => d.season == season)
    make_scatter();
    filterPerson(active_person)
}