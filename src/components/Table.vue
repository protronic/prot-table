<template>
  <div
    id="prot_table"
    ref="prot_table"
    :style="[
      update_column_sizes, {
        'grid-template-rows': 'repeat(' + (display_table_data.length + 1) + ', auto)', 
        'height': typeof table_options.height === 'number' ? table_options.height + 'px' : table_options.height,
        'overflow-y': table_options.height === 'auto' || table_options.height === undefined ? 'auto' : 'scroll',
      }, 
      table_options.tableStyles, 
      cssVariables
    ]"
    
  >
    <div
      v-for="(key, i) of get_header_list.keys"
      :key="key"
      :ref="'header'"
      :class="['header_field', 'header_col_' + i]"
      :style="[{}, table_options.headerStyles]"
      @click="sort_action($event, key)"
      @mouseup="table_options.resizable ? resizeClick($event, key, i) : false"
    >
      {{ get_header_list.display[key] }}
      <i
        :class="[
        'arrow', 
        (sort_arrow.key === key) ? (sort_arrow.dir === 'asc' ? 'down_1' : 'up_1') : '',
        (sort_arrow.secondary_key === key) ? (sort_arrow.secondary_dir === 'asc' ? 'down_2' : 'up_2') : ''
      ]"
      ></i>
    </div>
    <div
      v-show="table_options.resizable"
      v-for="(col, i) of get_header_list.keys"
      :ref="'resize'"
      :key="'resize_' + i"
      :class="['resize_field', 'resize_field_' + col]"
      :style="[{}, {}]"
      @click="resizeClick($event, col, i)"
    ></div>
    <div
      v-for="(col, i) of get_header_list.keys"
      v-show="table_options.filters.showInputs"
      :key="'filter_' + i"
      :class="['filter_field', 'filter_field_' + col]"
      :style="[{}, table_options.filters.divStyles || {}]"
      @mouseup="table_options.resizable ? resizeClick($event, col, i) : false"
    >
      <input
        type="text"
        ref="input"
        :style="[table_options.filters.inputStyles || {}]"
        @input="input_changed($event, col, i)"
      >
    </div>
    <template v-for="(row, j) in display_table_data">
      <template v-for="(col, i) in get_header_list.keys">
      <div
        :key="'row' + j + 'col' + i"
        :ref="'body'"
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i, j % 2 === 0 ? 'even_row' : 'odd_row']"
        :style="[].concat([
            {'grid-row': j + 4}, 
            table_options.bodyStyles, 
            (table_options.colStyles[col]) ? (table_options.colStyles[col]) : {},
          ], 
          table_options.rowStyles.map( value => (value.check_row(display_table_data[j], j) ? value.styles : {}))
        )"
        v-html="row[col]"
      ></div>
      <div
        :key="'row_details' + j + '_col' + i"
        :ref="'detail'"
        :class="['details_field']"
      ></div>
      </template>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import debounce from "lodash.debounce";

export default {
  name: "protVueTable",
  created(){
    for(let i in []){
      //this.dont_schow.push(i);
    }
  }, 
  data: function() {
    return {
      filter_inputs: {},
      table_options: {
        height: "auto",
        sortability: {},
        tableStyles: {},
        headerStyles: {},
        bodyStyles: {},
        rowStyles: [],
        colStyles: {},
        formatter: {},
        cssVariables: {},
        dontShowCols: [],
        filters: {
          connection_operation: "and",
          matchFilter: {},
          showInputs: true,
          inputRegExp: true
        },
        showTimers: true,
        headerDef: {},
        resizable: false
      },
      original_table_data: [],
      sorted_data: {
        data: [],
        currentSortKey: "",
        currentSortDir: "",
        previousSorts: [],
        previousSort_dirs: []
      },
      debug: [],
      // dont_schow: [],
    };
  },
  props: {
    table_data: Array,
    options: Object
  },
  created() {
    this.input_changed = debounce(this.input_changed, 500, {
      trailing: true,
      leading: false
    });
    this.sort_action = debounce(this.sort_action, 500, {
      trailing: false,
      leading: true
    });
  },
  updated() {
    this.$nextTick(() => {
      const cssVars = this.cssVariables;
      if (this.$refs && this.$refs.header) {
        this.$set(
          cssVars,
          "--filter-top-offset",
          `${this.$refs.header[0].offsetHeight}px`
        );
        this.$set(
          cssVars,
          "--grid-template-columns",
          `repeat(${this.display_table_data.length * 2 + 3} auto-fit, minmax(max-content, 100%))`
        );
      }
      this.table_options = this.options;
    });
  },
  computed: {
    display_table_data() {
      if (this.sorted_data.data) {
        if (this.table_options.showTimers) console.time("applying_filter");

        let filter_applied = this.sorted_data.data.filter(
          (row, row_index, full_data) => {
            let filter = this.table_options.filters;
            let result = [];
            if (filter && filter.matchFilter) {
              for (let key in filter.matchFilter) {
                if (filter.matchFilter[key]) {
                  if (
                    typeof filter.matchFilter[key] === "string" ||
                    filter.matchFilter[key] instanceof RegExp
                  ) {
                    if (row[key] !== undefined) {
                      result.push(
                        row[key]
                          .toString()
                          .toLowerCase()
                          .match(filter.matchFilter[key])
                      );
                    }
                  } else if (typeof filter.matchFilter[key] === "function") {
                    result.push(
                      filter.matchFilter[key](row[key], row_index, full_data)
                    );
                  }
                }
              }
            }
            if (filter.connection_operation === "or" && result.length === 0)
              return true;
            return result.reduce(
              (collector, current) =>
                filter.connection_operation === "and"
                  ? collector && current
                  : collector || current,
              filter.connection_operation === "and" ? true : false
            );
          }
        );

        if (this.table_options.showTimers) console.timeEnd("applying_filter");

        if (this.table_options.showTimers) console.time("applying_formatter");

        let formatter_applied = filter_applied;
        if (this.table_options.formatter) {
          let all_formatter = {};
          if(this.table_options.formatter['#all']){
            for(let i = 0; i < this.get_header_list.keys.length; i++){
              all_formatter[this.get_header_list.keys[i]] = (value, index, row) => (this.table_options.formatter['#all'](value, index, row));
            }
          }
          for(let key in this.table_options.formatter){
            all_formatter[key] = (value, index, row) => ( this.table_options.formatter['#all'](this.table_options.formatter[key](value, index, row), index, row) )
          }
          formatter_applied = filter_applied.map((row, row_index) => {
            const result = {};
            for (let key in row) {
              if (all_formatter[key]) {
                try{
                  result[key] = all_formatter[key](
                    row[key],
                    row_index,
                    row
                  );
                }
                catch(e){
                  if(e instanceof TypeError){  
                    console.log('caught error.')
                    all_formatter[key] = (value, index, row) => (this.table_options.formatter[key](value, index, row));
                  }
                }
              } else {
                result[key] = row[key];
              }
            }
            return result;
          });
        }
        if (this.table_options.showTimers)
          console.timeEnd("applying_formatter");
        return formatter_applied;
      } else {
        return [];
      }
    },
    cssVariables() {
      return this.table_options.cssVariables;
    },
    sort_arrow() {
      let secondary_key = "";
      let secondary_key_pos = 0;

      if (!this.sorted_data.previousSorts) this.sorted_data.previousSorts = [];

      for (let i = this.sorted_data.previousSorts.length - 1; i >= 0; i--) {
        if (
          this.sorted_data.previousSorts[i] !== this.sorted_data.currentSortKey
        ) {
          secondary_key = this.sorted_data.previousSorts[i];
          secondary_key_pos = i;
          break;
        }
      }

      return {
        key: this.sorted_data.currentSortKey,
        dir: this.sorted_data.currentSortDir,
        secondary_key: secondary_key,
        secondary_dir: this.sorted_data.previousSort_dirs
          ? this.sorted_data.previousSort_dirs[secondary_key_pos]
          : undefined
      };
    },
    get_sortability() {
      if (this.table_options.showTimers) console.time("sort_preperation_time");
      const result = {};
      if (this.table_options.sortability) {
        for (let key = 0; key < this.get_header_list.keys.length; key++) {
          const head = this.get_header_list.keys[key];
          if (
            !this.table_options.sortability[head] ||
            this.table_options.sortability[head] === "auto"
          ) {
            result[head] = this.original_table_data
              .map(row => row[head])
              .reduce(
                (collector, current) =>
                  current && Number.isNaN(Number(current)) ? "abc" : "123",
                "123"
              );
          } else {
            result[head] = this.table_options.sortability[head];
          }
        }
      }
      if (this.table_options.showTimers)
        console.timeEnd("sort_preperation_time");
      return result;
    },
    get_header_list() {
      if (this.table_options.showTimers) console.time("calc_header_time");
      let header_fields = [];
      let display_names = {};
      let fixed_widths = {};
      if (Object.keys(this.table_options.headerDef).length > 0) {
        for (let key in this.table_options.headerDef) {
          // this.debug.push({key:key})
          header_fields.push(key);
          display_names[key] = this.table_options.headerDef[key].displayName
            ? this.table_options.headerDef[key].displayName
            : key;
          fixed_widths[key] = this.table_options.headerDef[key].fixWidth
            ? this.table_options.headerDef[key].fixWidth
            : "auto";
        }
      } else {
        
        header_fields = this.original_table_data
          .map(value => Object.keys(value))
          .reduce((collector, current) => {
            for (let i = 0; i < current.length; i++) {
              if (!collector.includes(current[i])) collector.push(current[i]);
            }
            return collector;
          }, []);
        this.debug.push({header_fields: header_fields})
        for (let i = 0; i < header_fields.length; i++) {
          display_names[header_fields[i]] = header_fields[i];
          // this.debug.push({display_names: display_names})
        }
      }
      const result = {
        keys: header_fields.filter(value => {
          // this.debug.push(value);
          return !this.table_options.dontShowCols.includes(value) //&& typeof value !== 'function'//|| !this.dont_schow.includes(value);
        }),
        display: display_names,
        widths: fixed_widths
      };
      console.log({result: result})

      if (this.table_options.showTimers) console.timeEnd("calc_header_time");
      return result;
    },
    update_column_sizes() {
      if (Object.keys(this.get_header_list.widths).length === 0) return {};

      return {
        "grid-template-columns": Object.keys(this.get_header_list.widths)
          .map(value => this.get_header_list.widths[value])
          .join(" ")
      };
    }
  },
  methods: {
    resizeClick(event, col, ind){
      // if(!col && !ind){
      //   for (let i in this.$refs.resize) {
      //     this.$refs.resize[i].style.width = "auto";
      //   }
      // }
      // else{
      this.$refs.resize[ind].style.width = this.$refs.header[ind].offsetWidth;
      // }
      
    },
    input_changed(event, col, col_index) {
      try {
        let value = this.$refs.input[col_index].value;
        this.$set(
          this.filter_inputs,
          col,
          this.table_options.filters.inputRegExp && value !== ""
            ? RegExp(value, "gim")
            : value
        );
      } catch (err) {
        console.error(err);
      }
      this.table_options.filters.matchFilter = this.filter_inputs;
    },
    override_table_option() {
      for (let key in this.table_options) {
        this.$set(this.table_options, key, this.table_options[key]);
      }
    },
    sort_action(event, sort_key) {
      try {
        this.sort_data(sort_key, this.get_sortability[sort_key]);
      } catch (err) {
        console.error(err);
      }
    },
    compare_numbers(a, b) {
      if ( a[this.sorted_data.currentSortKey] === undefined )
        return 1;
      if ( b[this.sorted_data.currentSortKey] === undefined )
        return -1;
      return (
        this.sorted_data.currentSortDir === 'asc' ? 
          Number(a[this.sorted_data.currentSortKey]) - Number(b[this.sorted_data.currentSortKey]) :
          Number(b[this.sorted_data.currentSortKey]) - Number(a[this.sorted_data.currentSortKey]) 
      );
    },
    compare_strings(a, b) {
      if ( a[this.sorted_data.currentSortKey] === undefined )
        return 1;
      if ( b[this.sorted_data.currentSortKey] === undefined )
        return -1;
      const aValue = a[this.sorted_data.currentSortKey]
        .toString()
        .toLowerCase();
      const bValue = b[this.sorted_data.currentSortKey]
        .toString()
        .toLowerCase();
      if (aValue > bValue) {
        return this.sorted_data.currentSortDir === 'asc' ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sorted_data.currentSortDir === 'asc' ? -1 : 1;
      } else if (aValue === bValue) {
        return 0;
      }
    },
    sort_data(sort_key, sort_type) {
      if (this.table_options.showTimers) console.time("sort_time");
      const previous_key = this.sorted_data.currentSortKey;
      const previous_dir = this.sorted_data.currentSortDir;
      if (previous_key) this.sorted_data.previousSorts.push(previous_key);
      if (previous_dir) this.sorted_data.previousSort_dirs.push(previous_dir);
      this.sorted_data.currentSortKey = sort_key;
      this.sorted_data.currentSortDir =
        sort_key === previous_key
          ? previous_dir === "asc"
            ? "desc"
            : "asc"
          : "asc";
      if (typeof sort_type !== "function") {
        this.sorted_data.data = this.sorted_data.data
          .slice()
          .sort((a, b) =>
            sort_type === "123"
              ? this.compare_numbers(a, b)
              : this.compare_strings(a, b)
          );
      } else {
        this.sorted_data.data = this.sorted_data.data.slice().sort(sort_type);
      }
      // if (this.sorted_data.currentSortDir === "desc") {
      //   this.sorted_data.data.reverse();
      // }
      if (this.table_options.showTimers) console.timeEnd("sort_time");
    }
  },
  watch: {
    table_data: function(newValue) {
      this.original_table_data = newValue;
      Vue.set(this.sorted_data, "data", newValue);
    },
    options: function(newValue) {
      this.table_options = newValue;
    }
  }
};
</script>

<style>
  #prot_table a:link {
    color: var(--table-link-color);
    text-decoration: var(--table-link-deco);
  }

  #prot_table a:active {
    color: var(--table-active-color);
    text-decoration: var(--table-acitve-deco);
  }

  #prot_table a:hover {
    color: var(--table-hover-color);
    text-decoration: var(--table-hover-deco);
  }


  #prot_table a:visited {
    color: var(--table-visited-color);
    text-decoration: var(--table-visited-deco);
  }
</style>

<style scoped>
#prot_table {
  display: grid;
  position: relative;
  grid-template-rows: auto;
  grid-template-columns: var(--grid-template-columns);
  grid-gap: var(--grid-gap-row) var(--grid-gap-column);
  box-sizing: border-box;
  border: var(--table-border);
  align-content: start;
  font-size: var(--table-font-size);
  background: var(--grid-gap-color);
}

.header_field {
  grid-row: var(--grid-header-row);
  position: sticky;
  top: 0px;
  left: 0px;
  min-height: var(--header-min-height);
  overflow: var(--header-overflow);
  /* resize: var(--header-resize); */
  min-width: var(--header-min-size);
  background: var(--header-background);
  color: var(--header-font-color);
  border: var(--header-field-border);
  border-bottom: none;
}

.resize_field {
  grid-row: var(--grid-resize-row);
  content: ' ';
  min-height: 0.6em;
  overflow: var(--header-overflow);
  resize: var(--header-resize);
  min-width: var(--header-min-size);
  background: var(--header-background);
  color: var(--header-font-color);
  border: var(--header-field-border);
  border-top: none;
}

.filter_field {
  grid-row: var(--grid-filter-row);
  height: 1.5em;
  top: var(--filter-top-offset);
  left: 0px;
  position: sticky;
  box-sizing: border-box;
  border: var(--filter-field-border);
}

.filter_field input {
  position: relative;
  height: 98%;
  width: 100%;
  box-sizing: border-box;
  border: var(--header-field-border);
  font-family: var(--table-font-family);
  text-align: center;
  -webkit-box-shadow: inset 0px 0px 3% 6% rgba(0, 7, 89, 1);
  -moz-box-shadow: inset 0px 0px 3% 6% rgba(0, 7, 89, 1);
  box-shadow: inset 0px 0px 3% 6% rgba(0, 7, 89, 1);
}

.body_field {
  border: var(--body-field-border);
}

.body_field.even_row {
  background: var(--body-even-background);
  color: var(--body-even-font-color);
}

.body_field.odd_row {
  background: var(--body-odd-background);
  color: var(--body-odd-font-color);
}

.header_field,
.body_field,
.input_field {
  box-sizing: border-box;
  padding: 5px;
}

.arrow {
  display: inline-block;
  margin-left: 4px;
  padding: 3px;
}

.arrow:not(.up, .down, .up_2, .down_2) {
  border: none;
}

.up_1,
.down_1 {
  border: var(--arrow-1-border);
  border-width: var(--arrow-width);
}

.up_2,
.down_2 {
  border: var(--arrow-2-border);
  border-width: var(--arrow-width);
}

.up_1,
.up_2 {
  transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
}

.down_1,
.down_2 {
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}
</style>
