class Filter{
  
  updateOpt (opts){
    this.opts = opts;
  }

  apply (data, opts) {

    // filterOptions = {
    //   active: true,
    //   externelFunction: undefined,
    //   filter: {
    //     connection_operation: "and",
    //     matchFilter: {},
    //     showInputs: true,
    //     inputRegExp: true
    //   }
    // }
    if (opts.externelFunction !== undefined) {
      return opts.externelFunction(data, opts);
    }
    else if (!opts.active) {
      return data;
    }
    else {
      return data.filter(
        (row, row_index, full_data) => {
          let result = [];
          if (opts.options && opts.options.matchFilter) {
            opts.options.negate = {};
            for (let key in opts.options.matchFilter) {
              if (opts.options.matchFilter[key]) {
                opts.options.negate[key] = this.test_for_negation(opts.options.matchFilter[key])
                if (
                  typeof opts.options.matchFilter[key] === "string" ||
                  opts.options.matchFilter[key] instanceof RegExp
                ) {
                  if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                    result.push(
                      opts.options.negate[key].do_negate ? // fragezeichen op
                        !(row[key]
                          .toString()
                          .toLowerCase()
                          .match(opts.options.negate[key].filter)) : // else
                        row[key]
                          .toString()
                          .toLowerCase()
                          .match(opts.options.matchFilter[key])
                    );
                  }
                  else{
                    result.push(opts.options.negate[key].do_negate);
                  }
                } else if (typeof opts.options.matchFilter[key] === "function") {
                  result.push(
                    opts.options.matchFilter[key](row[key], row_index, full_data)
                  );
                }
              }
            }
          }
          if (opts.options.connection_operation === "or" && result.length === 0)
            return true;
          return result.reduce(
            (collector, current) =>
            opts.options.connection_operation === "and"
                ? collector && current
                : collector || current,
                opts.options.connection_operation === "and" ? true : false
          );
        }
      );
    }
  }

  test_for_negation(filter){
    const result = {
      do_negate: false,
      filter: undefined
    }
    if(filter instanceof RegExp){
      result.do_negate = (filter.source.match('!!!') !== null);
      result.filter = (new RegExp(filter.source.replace(/!!!/, ''), filter.flags));
    }
    else if (typeof filter === "string"){
      result.do_negate = (filter.match('!!!') !== null);
      result.filter = filter.replace(/!!!/, '');
    }
    else {
      result.do_negate = false;
    }
    return result;
  }
}

export default new Filter();
