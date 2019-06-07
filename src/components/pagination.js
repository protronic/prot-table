class Pagination {
  constructor(){
    this.paginationState = {
      current_page: 0,
      total_pages: 0
    }
  }

  updateOpt(opts){
    this.opts = opts;
  }

  apply(data, opts){

    // opts = {
    //   active: true,
    //   externalFunction: undefined,
    //   pagination: {
    //     rows: 100,
    //   }
    // }

    if (opts.externalFunction !== undefined){
      return opts.externalFunction(data, opts)
    }
    else if (!opts.active || !this.paginationState.total_pages > 0){
      return data;
    }
    else {
      let current_page = this.paginationState.current_page;
      return data.filter( (value, index) => (index >= (current_page * opts.options.rows) && (index < (current_page * opts.options.rows) + opts.options.rows) ? true : false));     
    }
  }
}

export default new Pagination();