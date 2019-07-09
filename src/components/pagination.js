class Pagination {
  constructor(){
  }

  updateOpt(opts){
    this.opts = opts;
  }

  apply(data, opts, cur, total_pages){

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
    else if (!opts.active || !total_pages > 0){
      return data;
    }
    else {
      // console.log('DATA LENGTH', data, data.length, opts.options.rows);
      
      let current_page = Math.min(cur, total_pages);
      
      return data.filter( (value, index) => (index >= (current_page * opts.options.rows) && (index < (current_page * opts.options.rows) + opts.options.rows) ? true : false));     
    }
  }
}

export default new Pagination();