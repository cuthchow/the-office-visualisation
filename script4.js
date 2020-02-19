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
        sentiment: +d.sentiment
    };
}).then(data => {
    dataset4 = data.filter(d => d.deleted == "False");
    scatter_init()
    filterSeason('1')
})

function scatter_init(){
    colors4 = chroma.scale([red, blue, green])
    svg4 = d3.select('#scatterplot').append('g')

    sceneScale = d3.scaleLinear([1, 55], [10, 800])
    episodeScale = d3.scaleLinear([1, 28], [50, 1000])
    seasonScale = d3.scaleLinear([1, 9], [10, 2400])
    sentScale4 = d3.scaleLinear([-0.5, 0.5], [0, 1])
}

function make_scatter(){
    svg4.selectAll('circle').remove()

    svg4.selectAll('circle').data(subdataset4).enter()
        .append('circle')
        .transition().delay((d, i) => i / 10).duration(500)
        .attr('cx', (d, i) => sceneScale(d.scene))
        .attr('cy', d => episodeScale(d.episode))
        .attr('r', 5)
        .attr('fill', (d, i) => colors4(sentScale4(d.sentiment)))
    
    svg4.selectAll('circle')
        .on('mouseover', scatterMouseOver)
        .on('mouseout', hideTooltip)
}

function scatterMouseOver(d, i){
    d3.select(this)
            .attr('opacity', 0.7)
            .attr('stroke-width', 3)
            .attr('stroke', 'black')

    d3.select('.tooltip')
        .style('left', (d3.event.pageX + 10)+ 'px')
        .style('top', (d3.event.pageY - 25) + 'px')
        .style('display', 'inline-block')
        .html(`Speaker: ${d.speaker} <br> Line: ${d.line_text} <br> Episode: S${d.season}, E${d.episode}<br>Sentiment: ${d.sentiment}`)
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