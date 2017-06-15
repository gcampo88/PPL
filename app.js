// TODO
// axis labels on graph
// allow toggling of maternity v paternity view
// add a readme


$(document).ready(() => {
  let companies;
  fetchCompanyData()
  .then((rawData) => prettifyData(rawData))
  .then((prettyData) => {
    companies = prettyData;
    setUpChart(companies, window.innerWidth - 100, 200)
  });

  window.addEventListener('resize', () => {
    d3.selectAll('svg').remove();
    setUpChart(companies, window.innerWidth - 100, 200);
  });
});


const fetchCompanyData = () => {
  return $.ajax('https://raw.githubusercontent.com/davedash/parental-leave/master/data.yaml')
  .then((data) =>  new Promise((resolve, reject) => resolve(data)));
}


const prettifyData = (string) => {
  const companies = string.split('-\n ')
                      .filter(el => el.length > 8)
                      .map(str => str.trim().split('\n'))
                      .map(co => {
                        let coInfo = {};
                        co.forEach(line => {
                          let parts = line.trim().split(/: /);
                          if (parts[1]) {
                            coInfo[parts[0].toLowerCase().trim()] = parts[1].trim();
                          }
                        })
                        return new Company(coInfo);
                      });
  return new Promise(function(resolve, reject) {
    resolve(companies)
  });
}

const setUpChart = (companies, width, height) => {
  if (!companies) {
    console.log('no companies!');
    return;
  }

  let svg = d3.select('div.graph')
              .append('svg')
              .attr('width', width + 50)
              .attr('height', height + 50);


  const heightPerWeek = (height / d3.max(companies, function(d) { return d.maternity; }))
  const widthPerCo    = width / companies.length;
  svg.selectAll('rect.bar')
     .data(companies)
     .enter()
     .append('rect')
     .attr('width', (d, i) => widthPerCo > 1 ? widthPerCo - 1 : widthPerCo)
     .attr('height', (d, i) => heightPerWeek *  d.maternity)
     .attr('x' , (d, i) => widthPerCo * i + 50)
     .attr('y' , (d, i) => height - heightPerWeek * d.maternity)
     .attr('fill', 'green')
     .on('click', (el) => showSpotlightInfo(el));

  let xScale = d3.scaleLinear()
                 .domain( [0, companies.length] )
                 .range( [0, width] );
  let xAxis = d3.axisBottom(xScale);

  svg.append('g')
     .attr('transform', `translate(50, ${height})`)
     .call(xAxis);

  let yScale = d3.scaleLinear()
                 .domain( [0, d3.max(companies, function(d) { return d.maternity; })] )
                 .range( [height, 0] );
  let yAxis = d3.axisLeft(yScale).ticks(5);

  svg.append('g')
     .attr('transform', 'translate(50)')
     .call(yAxis);
}

const showSpotlightInfo = company => {
  if (company) {
    $('.spotlight').removeClass('hidden');
    Object.keys(company).forEach(key => $(`#${key}`).html(company[key] || ''));
    $('#source').attr('href', company.source)
  }
}
