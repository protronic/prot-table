<template>
  <div 
    id="prot_table" 
    ref="prot_table"
    :style="[{
      'grid-template-rows': 'repeat(' + (display_table_data.length + 1) + ', auto)', 
      'height': typeof table_options.height === 'number' ? table_options.height + 'px' : table_options.height,
      'overflow-y': table_options.height === 'auto' || table_options.height === undefined ? 'auto' : 'scroll',
    }, table_options.tableStyles, cssVariables]"
  >
    <div 
      v-for="(key, i) in get_header_list" 
      :ref="'header'"
      :class="['header_field', 'header_col_' + i]" 
      :key="key"
      :style="[{}, table_options.headerStyles]"
      @click="sort_action($event, key)"
    >{{ key }}<i 
      :class="[
        'arrow', 
        (sort_arrow.key === key) ? (sort_arrow.dir === 'asc' ? 'down_1' : 'up_1') : '',
        (sort_arrow.secondary_key === key) ? (sort_arrow.secondary_dir === 'asc' ? 'down_2' : 'up_2') : ''
      ]"
    ></i></div>
    <div 
      v-for="(col, i) in get_header_list"
      v-show="table_options.filters.showInputs" 
      :key="'filter_' + i"
      :class="['filter_field', 'filter_field_' + col]"
      :style="[{'grid-row': 2}, table_options.filters.divStyles || {}]"
    >
      <input 
        type="text" 
        ref="input"
        :style="[table_options.filters.inputStyles || {}]"
        @input="input_changed($event, col, i)"
      >
    </div>
    <template 
      v-for="(row, j) in display_table_data"
    >
      <div 
        v-for="(col, i) in get_header_list" 
        :key="'row' + j + 'col' + i" 
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i, j % 2 === 0 ? 'even_row' : 'odd_row']"
        :style="[].concat([
          {'grid-row': j + 3}, 
          table_options.bodyStyles, 
          (table_options.colStyles[col]) ? (table_options.colStyles[col]) : {},
        ], table_options.rowStyles.map( value => (value.check_row(display_table_data[j], j) ? value.styles : {})))"
        v-html="row[col]"
      ></div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import debounce from 'lodash.debounce';

export default {
  name: "protVueTable",
  data: function(){
    return {
      filter_inputs: {},
      table_options: {
        "height": "auto", 
        "sortability": {},
        "tableStyles": {},
        "headerStyles": {},
        "bodyStyles": {},
        "rowStyles": [],
        "colStyles": {},
        "formatter": {},
        "cssVariables": {},
        "dontShowCols": [],
        "filters": {
          "connection_operation": "and",
          "matchFilter": {},
          "showInputs": true,
          "inputRegExp": true
        }
      },
      original_table_data: [],
      sorted_data: {
        data: [],
        currentSortKey: '',
        currentSortDir: '',
        previousSorts: [],
        previousSort_dirs: [],
      },
    };
  },
  props: {
    table_data: Array,
    options: Object,
  },
  created(){
    this.input_changed = debounce(this.input_changed, 500, {
      trailing: true,
      leading: false,
    });
  },
  updated(){
    this.$nextTick(() => {
      const cssVars = this.cssVariables;
      if(this.$refs && this.$refs.header){
        Vue.set(cssVars, '--filter-top-offset', `${this.$refs.header[0].offsetHeight}px`);
        // Vue.set(cssVars, '--grid-template-columns', `repeat(${this.get_header_list.length}, minmax(50px, 100%))`)
      }
      this.table_options = this.options;
    })
  },
  computed: {
    display_table_data(){
      if(this.sorted_data.data){
        return this.sorted_data.data.map((row, row_index) => {
          let result = {};
          for(let key in row){
            if(this.table_options.formatter[key]){
              result[key] = this.table_options.formatter[key](row[key], row_index);
            }
            else{
              result[key] = row[key];
            }
          }
          return result;
        }).filter((row, row_index, full_data) => {
          let filter = this.table_options.filters;
          let result = [];
          if(filter && filter.matchFilter){          
            for(let key in filter.matchFilter){
              if(filter.matchFilter[key]){
                if(typeof filter.matchFilter[key] === 'string'  || filter.matchFilter[key] instanceof RegExp){
                  if(row[key] !== undefined) {
                    result.push(row[key].toString().toLowerCase().match(filter.matchFilter[key]));
                  }
                } 
                else if(typeof filter.matchFilter[key] === 'function'){
                  result.push(filter.matchFilter[key](row[key], row_index, full_data));
                }
              }
            }
          }
          if(filter.connection_operation === 'or' && result.length === 0) return true;
          return result.reduce(
            (collector, current) => (filter.connection_operation === 'and' ? collector && current : collector || current), filter.connection_operation === 'and' ? true : false
          );
        });
      }
      else{
        return [];
      }
    },
    cssVariables(){
      return this.table_options.cssVariables;
    },
    sort_arrow(){
      let secondary_key = '';
      let secondary_key_pos = 0;
      
      if(!this.sorted_data.previousSorts) this.sorted_data.previousSorts = [];

      for(let i = this.sorted_data.previousSorts.length - 1; i >= 0; i--){
        if(this.sorted_data.previousSorts[i] !== this.sorted_data.currentSortKey){
          secondary_key = this.sorted_data.previousSorts[i];
          secondary_key_pos = i;
          break;
        }
      }

      return {
        key: this.sorted_data.currentSortKey, 
        dir: this.sorted_data.currentSortDir,
        secondary_key: secondary_key,
        secondary_dir: this.sorted_data.previousSort_dirs ? (this.sorted_data.previousSort_dirs[secondary_key_pos]) : undefined,
      };
    },
    get_sortability (){
      let result = {};
      if(this.table_options.sortability){
        for(let key in this.table_options.sortability){
          result[key] = this.table_options.sortability[key];
        }
      }

      if(Object.keys(result).length < this.get_header_list.length){
        for(let i = 0; i < this.get_header_list.length; i++){
          if(!Object.keys(result).includes(this.get_header_list[i])){
            result[this.get_header_list[i]] = 'auto';
          }
        }
      }

      for(let key in result){
        if(result[key] === 'auto'){
          result[key] = this.original_table_data.map(value => (value[key])).reduce( (collector, current) => {
            if(current && Number.isNaN(Number(current))){
              return 'abc';
            }
            return '123';
          }, '123');
        }
      }

      return result;
    },
    get_header_list(){
      try{
        let header_fields = this.original_table_data.map( value => (Object.keys(value)) ).reduce( (collector, current) => {
          for (let i in current){
            if (!collector.includes(current[i])) 
              collector.push(current[i])
          }            
          return collector;
        }
        , []);

        return header_fields.filter(value => {                    
          return !this.table_options.dontShowCols.includes(value);
        });
      }
      catch(err){
        console.error(err);
        return [];
      }
    },
  },
  methods: {
    input_changed(event, col, col_index){
      try {
        let value = this.$refs.input[col_index].value;
        this.$set(this.filter_inputs, col, this.table_options.filters.inputRegExp && value !== '' ? RegExp(value, 'gim') : value);
      }
      catch(err){
        console.error(err);
      }
      this.table_options.filters.matchFilter = this.filter_inputs;
    },
    override_table_option (){
      for(let key in this.table_options){
        this.$set(this.table_options, key, this.table_options[key]);
      }
    },
    sort_action(event, sort_key){
      try{
        this.sort_data(sort_key, this.get_sortability[sort_key])
      }
      catch(err){
        console.error(err);
      }
    },
    sort_data (sort_key, sort_type){
      let previous_key = this.sorted_data.currentSortKey;
      let previous_dir = this.sorted_data.currentSortDir;
      if (previous_key) this.sorted_data.previousSorts.push(previous_key);
      if (previous_dir) this.sorted_data.previousSort_dirs.push(previous_dir);
      this.sorted_data.currentSortKey = sort_key;
      this.sorted_data.currentSortDir = (sort_key === previous_key) ? (previous_dir === 'asc' ? 'desc' : 'asc') : ('asc');
      if (typeof sort_type !== 'function'){
        this.sorted_data.data = this.sorted_data.data.slice().sort( (a, b) => {
          if(sort_type === '123'){
            return Number(a[sort_key]) - Number(b[sort_key]);
          }
          else{
            if(a[sort_key] > b[sort_key]){
              return 1;
            }
            else if(a[sort_key] < b[sort_key]){
              return -1;
            }
            else return 0;
          }
        });
      }
      else{
        this.sorted_data.data = this.sorted_data.data.slice().sort(sort_type);
      }
      if(this.sorted_data.currentSortDir === 'desc'){
        this.sorted_data.data.reverse();
      }
    }
  },
  watch: {
    table_data: function(newValue){
      this.original_table_data = newValue;
      Vue.set(this.sorted_data, 'data', newValue);
    },
    options: function(newValue){
      this.table_options = newValue;
    }
  }
}
</script>

<style scoped>

#prot_table{
  display: grid;
  position: relative;
  grid-template-rows: auto;
  grid-template-columns: var(--grid-template-columns);
  overflow-x: auto;
  box-sizing: border-box;  
  border: var(--table-border);
  align-content: start;
  font-size: var(--table-font-size);
}

.header_field{
  grid-row: 1;
  position: sticky;
  top: 0px;
  left: 0px;
  background: var(--header-background);
  color: var(--header-font-color);
  border: var(--header-field-border);
}

.filter_field {
  grid-row: 2;
  height: 1.5em;
  top: var(--filter-top-offset);
  left: 0px;
  position: sticky;
  box-sizing: border-box;
}

.filter_field input {
  position: relative;
  height: 98%;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--table-font-family);
  text-align: center;
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

.header_field, .body_field {
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

.up_1, .down_1 {
  border: var(--arrow-1-border);
  border-width: var(--arrow-width);
}

.up_2, .down_2 {
  border: var(--arrow-2-border);
  border-width: var(--arrow-width);
}

.up_1, .up_2 {
  transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
}

.down_1, .down_2 {
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}

</style>
