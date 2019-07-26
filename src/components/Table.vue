<template>
  <div
    id="prot_table"
    ref="prot_table"
    :style="[
      update_column_sizes, {
        'grid-template-rows': 'repeat(' + (display_table_data.length + 4) + ', auto)', 
        'max-height': typeof table_options.height === 'number' ? table_options.height + 'px' : table_options.height,
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
          (sort_arrow.key === key) ? (sort_arrow.dir === 'asc' ? 'up_1' : 'down_1') : '',
          (sort_arrow.secondary_key === key) ? (sort_arrow.secondary_dir === 'asc' ? 'up_2' : 'down_2') : ''
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
      v-show="table_options.filters.options.showInputs"
      :key="'filter_' + i"
      :class="['filter_field', 'filter_field_' + col]"
      :style="[{}, table_options.filters.options.divStyles || {}]"
      @mouseup="table_options.resizable ? resizeClick($event, col, i) : false"
    >
      <input
        type="text"
        ref="input"
        :style="[table_options.filters.options.inputStyles || {}]"
        v-model="table_options.filters.options.filter_inputs[col]"
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
          @click="close_dropdown()"
          v-html="row[col]"
        ></div>
        <div :key="'row_details' + j + '_col' + i" :ref="'detail'" :class="['details_field']"></div>
      </template>
    </template>
    <div id="footer" ref="footer">
      <div class="totalCount">Zeilen: {{ datalength }}, Zeilen pro Seite: {{ table_options.pagination.options.rows }}</div>
      <col-selector ref="column_dropdown" :all_columns="get_header_list.all" :table_height="clientHeight" @column_show_toggle="column_visibility_change" @reset_url="reset_url()"></col-selector>
      <div class="stopper"></div>
      <div class="firstPage pageEnd" v-show="(get_total_pages() > 1)" @click="change_to_page(0)">&lt;&lt;</div>
      <div class="previousPage pageSelect" v-show="(get_total_pages() > 1)" @click="change_to_page(Math.max(get_current_page() - 1, 0))">&lt;</div>
      <div v-for="(e, i) in [...Array(Math.min(get_total_pages(), 9))]" v-show="(get_total_pages() > 1)" :key="i" class="pageSelect" @click="change_to_page(i)">{{i + 1}}</div>
      <div v-show="get_total_pages() > 9" class="pageSelect">..</div>
      <div class="nextPage pageSelect" v-show="(get_total_pages() > 1)" @click="change_to_page(Math.min(get_current_page() + 1, get_total_pages() - 1))">&gt;</div>
      <div class="lastPage pageEnd" v-show="(get_total_pages() > 1)" @click="change_to_page(get_total_pages() - 1)">&gt;&gt;</div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import debounce from "lodash.debounce";
import { Promise } from 'q';
import { setTimeout } from 'timers';
import formatter from './formatter.js';
import pagination from './pagination.js';
import filter from './filter.js';
import colSelector from './colSelector.vue'


// console.log({filter, formatter, pagination})

function stringify_regex(key, value){
  // console.log(`Key: ${key}; Value: ${value};`)
  if(value instanceof RegExp){
    return value.toString();
  }
  else
    return value;
}

function parse_regex(key, val){
  if(typeof val === 'string'){
    // console.log({key: key, val: val})
    let matches = val.match(/\/(.*)\/(.*)/);
    // console.log(matches);
    if (matches)
      return new RegExp(matches[1], matches[2]);
    else 
      return val;  
  }
  else{
    return val;
  }
}

// let filter = require('../modules/filter');
// let formatter = require('../modules/formatter');
// let pagination = require('../modules/pagination');

export default {
  name: "protVueTable",
  components:{
    colSelector
  },
  created() {
    for (let i in []) {
      //this.dont_schow.push(i);
      
    }
  },
  data: function() {
    return {
      clientHeight: 0,
      datalength: 0,
      table_options: {
        height: "auto",
        sortability: {},
        tableStyles: {},
        headerStyles: {},
        bodyStyles: {},
        rowStyles: [],
        colStyles: {},
        formatter: {
          active: true,
          externelFunction: undefined,
          options: {}
        },
        cssVariables: {},
        dontShowCols: [],
        filters: {
          active: true,
          externelFunction: undefined,
          options: {
            connection_operation: "and",
            matchFilter: {},
            showInputs: true,
            inputRegExp: true,
            filter_inputs: {},
          }
        },
        showTimers: true,
        headerDef: {},
        resizable: false,
        routing: true,
        pagination: {
          active: true,
          externelFunction: undefined,
          options: {
            rows: 300
          }
        }
      },
      original_table_data: [],
      sorted_data: {
        data: [],
        currentSortKey: "",
        currentSortDir: "",
        previousSorts: [],
        previousSort_dirs: []
      },
      paginationState :{
        current_page: 0,
        total_pages: 0
      },
      debug: [],
      filter: filter,
      formatter: formatter,
      pagination: pagination,
      output_display_options: {}
      // dont_schow: [],
      // current_page: 0,
      // total_pages: 0
    };
  },
  props: {
    table_data: Array,
    options: Object,
    display_options: String,
    filterOpt: Object,
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
  mounted() {
    // if(this.display_options){
    //   let {filterBy, sortBy} = JSON.parse(atob(this.display_options), parse_regex);
    //   let useSortBy = false;
    //   let useFilterBy = false;
      
    //   if( this.get_url_parameter('sortBy').notFound){
    //     useSortBy = true;
    //   }
    //   if( this.get_url_parameter('filterBy').notFound){
    //     useFilterBy = true;
    //   }

    //   this.$nextTick(function(){
        
    //     if(useFilterBy){
    //       for(let key in filterBy){
    //         console.log(`---- setting filter ${key} to /${filterBy[key].source}/`)
    //         this.$set(this.options.filters.options.filter_inputs, key, filterBy[key].source);
    //         this.$set(this.options.filters.options.matchFilter, key, filterBy[key]);
    //       }
    //     }

    //     if(useSortBy){
    //       for(let i = 0; i < sortBy.length; i++){
    //         if(sortBy[i].dir === 'desc'){
    //           this.undebounced_sort_action(undefined, sortBy[i].col)
    //           this.undebounced_sort_action(undefined, sortBy[i].col)
    //         }
    //         else{
    //           this.undebounced_sort_action(undefined, sortBy[i].col)
    //         }
    //       }
    //     }
    //   })
    // }
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

        let headers = this.$refs.header;

        window.addEventListener('resize', function(event){
          Vue.set(cssVars, "--filter-top-offset",  `${headers[0].offsetHeight}px`)
        });

        this.$set(
          cssVars,
          "--grid-template-columns",
          `repeat(${this.display_table_data.length * 2 +
            4} auto-fit, minmax(max-content, 100%))`
        );
        this.$set(
          cssVars,
          "--grid-footer-area",
          `${this.display_table_data.length * 2 + 4} / 1 / ${this.display_table_data.length * 2 + 4} / ${this.get_header_list.keys.length + 1}`
        );
        if(this.table_options.pagination.active){
          this.paginationState.total_pages = Math.ceil(this.original_table_data.length / this.table_options.pagination.options.rows)
        }
        else{
          this.paginationState.total_pages = 0;
        }

        this.clientHeight = this.$refs.prot_table.clientHeight;
      }
      this.table_options = this.options;
    });
  },
  computed: {
    get_client_height(){
      return this.$refs.prot_table ? this.$refs.prot_table.clientHeight : 0;
    },
    display_table_data(){
      console.log({sorted: this.sorted_data.data, original: this.original_table_data, options: this.table_options, pageination: this.paginationState})
      if ((this.sorted_data.data || this.original_table_data) && this.table_options) {
        let data = this.sorted_data.data || this.original_table_data;
        let filter_applied = data
        try{
          console.time('filter')
          filter_applied = filter.apply(data, this.table_options.filters);
          this.datalength = filter_applied.length;
          console.timeEnd('filter')
        }
        catch(err){
          console.error(err)
        }
        
        let formatter_applied = filter_applied;
        try{
          console.time('formatter')
          formatter_applied = formatter.apply(filter_applied, this.table_options.formatter, this.get_header_list) ;
          console.timeEnd('formatter')
        }
        catch(err){
          console.error(err)
        }
        
        let paginated = formatter_applied;
        try{
          // this.set_page_total();
          console.time('pagination_filter')
          paginated = pagination.apply(formatter_applied, this.table_options.pagination, this.paginationState.current_page, this.paginationState.total_pages);
          console.timeEnd('pagination_filter')
        }
        catch(err){
          console.error(err)
        }
        return paginated;
      }
      else{
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
        this.debug.push({ header_fields: header_fields });
        for (let i = 0; i < header_fields.length; i++) {
          display_names[header_fields[i]] = header_fields[i];
          // this.debug.push({display_names: display_names})
        }
      }
      let hideColumns = this.get_url_parameter('hideColumns', false);
      let display = this.display_options ? JSON.parse(atob(this.display_options), parse_regex) : {};
      if(!display.hideColumns || !hideColumns.notFound) display.hideColumns = [];
      console.log('hidecolumns', hideColumns.value, 'type: ', typeof hideColumns.value)
      if(hideColumns.value)
        this.$set(this.table_options, 'dontShowCols', hideColumns.value);
      else
        this.$set(this.table_options, 'dontShowCols', display.hideColumns);
      const result = {
        keys: header_fields.filter(value => {
          // this.debug.push(value);
          return !this.table_options.dontShowCols.includes(value) && !display.hideColumns.includes(value) && !hideColumns.value.includes(value); //&& typeof value !== 'function'//|| !this.dont_schow.includes(value);
        }),
        display: display_names,
        widths: fixed_widths,
        all: header_fields,
        hidden: hideColumns.value,
      };
      console.log({ header_result: result });

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
    // update_export_display_options(type, updateObject){
    //   this.output_display_options[type] = updateObject;
    //   console.log(`%cexport display_options: %c${btoa(JSON.stringify(this.output_display_options, stringify_regex))}`, "color: green;", "background: green; color: white;")
    // },
    close_dropdown(){
      if(this.$refs.column_dropdown.show)
        this.$refs.column_dropdown.show = false;
    },
    update_export_display_options(routeUrl){
      let filterByParam = {};
      for(let key in this.table_options.filters.options.matchFilter){
        if(this.table_options.filters.options.matchFilter[key]) filterByParam[key] = this.table_options.filters.options.matchFilter[key]
      }        
      let sortArray = [].concat(...this.sorted_data.previousSorts, this.sorted_data.currentSortKey)
        .slice(-2)
        .map((val, ind) => ({
          col: val,
          dir: [].concat(...this.sorted_data.previousSort_dirs, this.sorted_data.currentSortDir).slice(-2)[ind]
      }));
      if (this.table_options.routing && routeUrl !== false){
        this.set_url_parameter(
          "sortBy",
          sortArray
        );
        this.set_url_parameter(
          'filterBy', 
          filterByParam
        );
        this.set_url_parameter(
          'hideColumns', 
          this.table_options.dontShowCols || []
        );
        // this.update_export_display_options('sortBy', sortArray);
        // this.output_display_options.sortBy = sortArray;
      }
      this.output_display_options['sortBy'] = sortArray;
      this.output_display_options['filterBy'] = filterByParam;
      this.output_display_options['hideColumns'] = this.table_options.dontShowCols;
      console.log(`%cexport display_options: %c${btoa(JSON.stringify(this.output_display_options, stringify_regex))}`, "color: green;", "background: green; color: white;")
    },
    change_sort(sorting){
      for(let i = 0; i < sorting.length; i++){
        if(sorting[i].dir === 'desc'){
          this.undebounced_sort_action(undefined, sorting[i].col)
          this.undebounced_sort_action(undefined, sorting[i].col)
        }
        else{
          this.undebounced_sort_action(undefined, sorting[i].col)
        }
      }
    },
    change_filter(filters){
      for(let key in filters){
        console.log(`---- setting filter ${key} to /${filters[key].source}/`)
        this.$set(this.options.filters.options.filter_inputs, key, filters[key].source);
        this.$set(this.options.filters.options.matchFilter, key, filters[key]);
      }
    },
    change_to_page(page){
      this.paginationState.current_page = page;
      this.$refs.prot_table.scrollTop = 0;
    },
    get_total_pages(){
      return Math.min(this.paginationState.total_pages, Math.ceil(this.datalength / this.table_options.pagination.options.rows));
    },
    get_current_page(){
      return Math.min(this.paginationState.total_pages, this.paginationState.current_page);
    },
    set_page_total(){
      // console.log(this.paginationState.total_pages, Math.ceil(this.datalength / this.table_options.pagination.options.rows))
      if(this.paginationState.total_pages != Math.ceil(this.datalength / this.table_options.pagination.options.rows)){
        this.paginationState.total_pages = Math.ceil(this.datalength / this.table_options.pagination.options.rows);
        this.paginationState.current_page = Math.min(this.paginationState.current_page, this.paginationState.total_pages);
      }
    },
    resizeClick(event, col, ind) {
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
      this.undebounced_input_changed(event, col, col_index);
    },
    undebounced_input_changed(event, col, col_index){
      try {
        console.log('---- input change detected')
        let value = this.$refs.input[col_index].value;
        this.$set(
          this.table_options.filters.options.matchFilter,
          col,
          this.table_options.filters.options.inputRegExp && value !== ""
            ? new RegExp(value, "gim")
            : value
        );
        
        this.update_export_display_options(true)
        // console.log(JSON.stringify(filterByParam, (key, value) => (value instanceof RegExp ? '/' + value.source + '/' + value.flags : value)))
      
      } catch (err) {
        console.error(err);
      }
      // for(let key in this.table_options.filters.options.filter_inputs){
      //   this.table_options.filters.options.matchFilter[key] = this.table_options.filters.options.filter_inputs[key];
      //   this.options.filters.options.matchFilter[key] = this.table_options.filters.options.filter_inputs[key];
      //   this.$set(this.table_options.filters.options.matchFilter, key, this.table_options.filters.options.filter_inputs[key]);
      // }
      
      // this.table_options.filters.options.matchFilter = this.table_options.filters.options.filter_inputs;
    },
    override_table_option() {
      for (let key in this.table_options) {
        this.$set(this.table_options, key, this.table_options[key]);
      }
    },
    sort_action(event, sort_key) {
      this.undebounced_sort_action(event, sort_key);
    },
    undebounced_sort_action(e, sort_key){
      try {
        this.sort_data(sort_key, this.get_sortability[sort_key], e === undefined ? false : true);
      } catch (err) {
        console.error(err);
        this.sort_data(sort_key, 'abc', e === undefined ? false : true)
      }
    },
    compare_numbers(a, b) {
      if (a[this.sorted_data.currentSortKey] === undefined) return 1;
      if (b[this.sorted_data.currentSortKey] === undefined) return -1;
      return this.sorted_data.currentSortDir === "asc"
        ? Number(a[this.sorted_data.currentSortKey]) -
            Number(b[this.sorted_data.currentSortKey])
        : Number(b[this.sorted_data.currentSortKey]) -
            Number(a[this.sorted_data.currentSortKey]);
    },
    compare_strings(a, b) {
      if (a[this.sorted_data.currentSortKey] === undefined) return 1;
      if (b[this.sorted_data.currentSortKey] === undefined) return -1;
      const aValue = a[this.sorted_data.currentSortKey]
        .toString()
        .toLowerCase();
      const bValue = b[this.sorted_data.currentSortKey]
        .toString()
        .toLowerCase();
      if (aValue > bValue) {
        return this.sorted_data.currentSortDir === "asc" ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sorted_data.currentSortDir === "asc" ? -1 : 1;
      } else if (aValue === bValue) {
        return 0;
      }
    },
    sort_data(sort_key, sort_type, routeUrl) {
      if (this.table_options.showTimers) console.time("sort_time");
      const previous_key = this.sorted_data.currentSortKey;
      const previous_dir = this.sorted_data.currentSortDir;
      if (previous_key && previous_key !== sort_key) this.sorted_data.previousSorts.push(previous_key);
      if (previous_dir && previous_key !== sort_key) this.sorted_data.previousSort_dirs.push(previous_dir);
      this.sorted_data.currentSortKey = sort_key;
      this.sorted_data.currentSortDir =
        sort_key === previous_key
          ? previous_dir === "asc"
            ? "desc"
            : "asc"
          : "asc";
      // if(this.sorted_data.currentSortKey === this.sorted_data.previousSorts.slice(-1)[0]){
      //   this.sorted_data.previousSorts = this.sorted_data.previousSorts.slice(0, -1);
      //   this.sorted_data.previousSort_dirs = this.sorted_data.previousSort_dirs.slice(0, -2).concat(this.sorted_data.previousSort_dirs.slice(-1)[0])
      // }
      // console.log([].concat(...this.sorted_data.previousSorts, this.sorted_data.currentSortKey))
      // console.log([].concat(...this.sorted_data.previousSort_dirs, this.sorted_data.currentSortDir))
      this.update_export_display_options(routeUrl)
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
    },
    set_url_parameter(param, value) {
      let resultURI = "";
      let url = decodeURI(location.href);
      if (url.includes("?")) {
        let match = url
          .split("?")
          .slice(1)
          .join("?")
          .split("&")
          .reduce((col, cur) => (cur.split("=")[0] === param ? cur : col), "");
        resultURI =
          match === ""
            ? `${url}&${param}=${btoa(JSON.stringify(value, stringify_regex))}`
            : url.replace(match, `${param}=${btoa(JSON.stringify(value, stringify_regex))}`);
      } else {
        resultURI = `${url}?${param}=${btoa(JSON.stringify(value, stringify_regex))}`;
      }

      history.pushState(null, "", encodeURI(resultURI));
    },
    get_url_parameter(param, showError) {
      let result = { key: param, value: "" };
      let url = location.href;

      try {
        let value = decodeURI(url
          .split("?")
          .slice(1)
          .join("?")
          .split("&")
          .reduce(
            (col, cur) =>
              cur.split("=")[0] === param ? cur.split("=")[1] : col,
            ""
          ));
        result.value = JSON.parse(atob(value), parse_regex);
      } catch (e) {
        result.notFound = true;
        if(showError) console.error(`parameter ${param} wurde im Link nicht gefunden.`)
      }

      return result;
    },
    logCurrent(){
      console.log(this.paginationState.current_page)
    },
    column_visibility_change(column, change){
      // console.log('table', column, change)
      if(change && this.table_options.dontShowCols !== undefined && this.table_options.dontShowCols.includes(column)){
        this.table_options.dontShowCols = this.table_options.dontShowCols.filter((key) => (key !== column));
      }
      else if(!change){
        console.log(this.table_options.dontShowCols)
        this.table_options.dontShowCols.push(column);
      }
      this.update_export_display_options(true)
    },
    change_hidden_columns(hideColumns){
      this.$refs.column_dropdown.unchecked_columns = hideColumns;
      // this.$set(this.table_options, 'dontShowCols', hideColumns);
    },
    reset_url(){
      let url = decodeURI(location.href);
      let result = url.split('?')[0] + '?' +  url.split('?')[1].split('&').filter( pair => {let variable = pair.split('=')[0]; if ( variable === 'sortBy' || variable === 'filterBy' || variable === 'hideColumns') return false; else return true }).join('&')
      location.href = encodeURI(result);
    }
  },
  watch: {
    table_data: function(newValue) {
      this.original_table_data = newValue;
      for(let i = 0; i < this.get_header_list.keys.length; i++){
        this.table_options.filters.options.filter_inputs[this.get_header_list.keys[i]] = ''
      }
      
      Vue.set(this.sorted_data, "data", newValue);
      console.log('---- data changed')
      // console.log('JSON in: ', this.display_options ? atob(this.display_options) : '')
      let display = this.display_options ? JSON.parse(atob(this.display_options), parse_regex) : {};

      try{
        let sortBy = this.get_url_parameter('sortBy', true);

        // console.log(sortBy)
        if(!sortBy.notFound){
          this.change_sort(sortBy.value);
        }
        else{
          if(display && display.sortBy)
            this.change_sort(display.sortBy);
        }
      }
      catch(e){
        console.error('Sort error')
        console.error(e)
      }

      try{
        let filterBy = this.get_url_parameter('filterBy', true);
      
        if(!filterBy.notFound){
          this.change_filter(filterBy.value);
        }
        else{
          if(display && display.filterBy)
            this.change_filter(display.filterBy);
        }
      }
      catch(e){
        console.error('Filter error')
        console.error(e)
      }

      try{
        let hideColumns = this.get_url_parameter('hideColumns', true);
        // console.log('hideCols: ', hideColumns)
        if(!hideColumns.notFound){
            this.change_hidden_columns(hideColumns.value);           
          // this.table_options.dontShowCols = hideColumns.value;
        }
        else{
          if(display && display.hideColumns)
            this.change_hidden_columns(display.hideColumns);
        }
      }
      catch(e){
        console.error('hidden Columns Error')
        console.error(e);
      }
    },
    options: function(newValue) {
      // this.table_options = newValue;
      console.log('---- options changed')

      for(let key in newValue){
        this.$set(this.table_options, key, newValue[key]);
        this.input_changed(new Event(''), key, this.get_header_list.keys.indexOf(key))
      }
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

.pageSelect:hover, .pageEnd:hover {
  background: var(--grid-gap-color);
  cursor: pointer;
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
  content: " ";
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
  box-sizing: content-box;
  border-top: var(--filter-field-border);
  border-bottom: var(--filter-field-border);
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

#footer {
  height: 1.5em;
  background: var(--header-background);
  box-sizing: content-box;
  border-top: var(--filter-field-border);
  grid-area: var(--grid-footer-area);
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  vertical-align: middle;
}

.pageEnd {
  width: 2em;
}

.pageSelect {
  width: 1em;
}

.pageSelect, .pageEnd {
  height: 1em;
  margin-top: auto;
  margin-bottom: auto;
  vertical-align: middle;
  /* overflow: hidden; */
}

.totalCount {
  height: 1em;
  width: 30%;
  text-align: left;
  margin-top: auto;
  margin-bottom: auto;
  vertical-align: middle;
  margin-right: 30%;
}

.stopper {
  height: 1em;
  width: 40%;
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
