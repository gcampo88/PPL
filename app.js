$(document).ready(() => {
  getData();
})

let companies;

function Company (options) {
  this.name = options.company;
  this.maternity = +options.maternity;
  this.paternity = +options.paternity;
  this.notes = options.notes;
  this.source = options.source;
  this.date = options.date;
}

const getData = () => {
  d3.select('div').style('color', 'red');
  $.ajax({url: 'https://raw.githubusercontent.com/davedash/parental-leave/master/data.yaml'})
  .then((data) => {
    prettifyData(data);

    //  pass the companies along in a promise to set up the visuals
  })
}

const prettifyData = (string) => {
  const arr = string.split('-\n ')
                      .filter((el) => el.length > 8)
                      .map((str) => str.trim().split('\n'));
  companies = arr.map((co) => {
    let companyInfo = {};
    co.forEach((line) => {
      let parts = line.trim().split(/: /);
      if (parts[1]) {
        companyInfo[parts[0].toLowerCase().trim()] = parts[1].trim();
      }
    })
    return new Company(companyInfo);
  })
  return companies;
}
