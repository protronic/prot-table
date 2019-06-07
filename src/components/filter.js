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
            for (let key in opts.options.matchFilter) {
              if (opts.options.matchFilter[key]) {
                if (
                  typeof opts.options.matchFilter[key] === "string" ||
                  opts.options.matchFilter[key] instanceof RegExp
                ) {
                  if (row[key] !== undefined) {
                    result.push(
                      row[key]
                        .toString()
                        .toLowerCase()
                        .match(opts.options.matchFilter[key])
                    );
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
}



export default new Filter();
