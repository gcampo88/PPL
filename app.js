$(document).ready(() => {
  let companies;

  fetchData()
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


const fetchData = () => {
  return $.ajax('https://raw.githubusercontent.com/davedash/parental-leave/master/data.yaml')
  .then((data) =>  new Promise((resolve, reject) => resolve(data)));
}


const prettifyData = (string) => {
  const arr = string.split('-\n ')
                      .filter((el) => el.length > 8)
                      .map((str) => str.trim().split('\n'));
  let companies = arr
              .map((co) => {
                let companyInfo = {};
                co.forEach((line) => {
                  let parts = line.trim().split(/: /);
                  if (parts[1]) {
                    companyInfo[parts[0].toLowerCase().trim()] = parts[1].trim();
                  }
                })
                return new Company(companyInfo);
              })
              .sort((a, b) => {
                return a.maternity - b.maternity
              });
  console.log(companies);
  return new Promise(function(resolve, reject) {
    resolve(companies)
  });
}

const setUpChart = (companies, width, height) => {
  if (!companies) {
    console.log('no companies!');
    return;
  }

  let svg = d3.select('div.content')
              .append('svg')
              .attr('width', width + 50)
              .attr('height', height + 50);


  svg.selectAll('rect.bar')
     .data(companies)
     .enter()
     .append('rect')
     .attr('width', (d, i) => width / companies.length - 1)
     .attr('height', (d, i) => d.maternity )
     .attr('x' , (d, i) => (width / companies.length) * i + 50)
     .attr('y' , (d, i) => height - (d.maternity))
     .attr('fill', 'blue')
     .on('click', (el) => { console.log('clicked el:', el); });

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

class Company {
  constructor (options) {
    this.name = options.company;
    this.maternity = +options.maternity;
    this.paternity = +options.paternity;
    this.notes = options.notes;
    this.source = options.source;
    this.date = options.date;
  }
}
