
class Formatter {
  
  updateOpt(opts){
    this.opts = opts;
  }

  apply (data, opts, headerList) {

    // opts = {
    //   active: true,
    //   externelFunction: undefined,
    //   formatter: {}
    // }

    if (opts.module !== undefined) {
      return opts.externelFunction(data, opts, headerList);
    }
    else if (!opts.active) {
      return data;
    }
    else {
      let all_formatter = {};
      let formatter = opts.options;
      if (formatter["#all"]) {
        for (let i = 0; i < headerList.keys.length; i++) {
          all_formatter[headerList.keys[i]] = (
            value,
            index,
            row
          ) => formatter["#all"](value, index, row);
        }
      }
      for (let key in formatter) {
        all_formatter[key] = (value, index, row) =>
        formatter["#all"](
          formatter[key](value, index, row),
            index,
            row
          );
      }
      return data.map((row, row_index) => {
        const result = {};
        for (let key in row) {
          if (all_formatter[key]) {
            try {
              result[key] = all_formatter[key](row[key], row_index, row);
            } catch (e) {
              if (e instanceof TypeError) {
                console.log("caught error.");
                all_formatter[key] = (value, index, row) =>
                formatter[key](value, index, row);
              }
            }
          } else {
            result[key] = row[key];
          }
        }
        return result;
      });
    }
  }
}

export default new Formatter();