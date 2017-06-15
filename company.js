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
