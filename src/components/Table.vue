<template>
  <div 
    id="prot_table" 
    ref="prot_table"
    :style="[{
      'grid-template-rows': 'repeat(' + (table_data.length + 1) + ', auto)', 
      'height': typeof table_options.height === 'number' ? table_options.height + 'px' : table_options.height,
      'overflow-y': table_options.height === 'auto' || table_options.height === undefined ? 'auto' : 'scroll',
    }, table_options.tableStyles, cssVariables]"
  >
    <div 
      v-for="(key, i) in header_fields" 
      :ref="'header'"
      :class="['header_field', 'header_col_' + i]" 
      :key="key"
      :style="[{}, table_options.headerStyles]"
      @click="sortClick($event, key)"
    >{{ key }}<i 
      :class="[
        'arrow', 
        (sort_arrow.key === key) ? (sort_arrow.dir === 'asc' ? 'down_1' : 'up_1') : '',
        (sort_arrow.secondary_key === key) ? (sort_arrow.secondary_dir === 'asc' ? 'down_2' : 'up_2') : ''
      ]"
    ></i></div>
    <div 
      v-for="(col, i) in header_fields"
      v-show="table_options.filters.showInputs" 
      :key="'filter_' + i"
      :class="['filter_field', 'filter_field_' + col]"
      :style="[{'grid-row': 2}, table_options.filters.divStyles || {}]"
    >
      <input 
        type="text" 
        :style="[table_options.filters.inputStyles || {}]"
        @input="input_changed($event, col)"
      >
    </div>
    <template 
      v-for="(row, j) in table_data"
    >
      <div 
        v-for="(col, i) in header_fields" 
        :key="'row' + j + 'col' + i" 
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i, j % 2 === 0 ? 'even_row' : 'odd_row']"
        :style="[].concat([
          {'grid-row': j + 3}, 
          table_options.bodyStyles, 
          (table_options.colStyles[col]) ? (table_options.colStyles[col]) : {},
        ], table_options.rowStyles.map( value => (value.check_row(table_data[j], j, get_state, get_getters) ? value.styles : {})))"
        v-html="row[col]"
      ></div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: "protVueTable",
  data: function(){
    return {
      filter_inputs: {}
    };
  },
  updated(){
    this.$nextTick(() => {
      let cssVars = this.cssVariables;
      console.log(this.$refs)
      Vue.set(cssVars, '--filter-top-offset', `${this.$refs.header[0].offsetHeight}px`);
      Vue.set(cssVars, '--grid-template-rows', )
      // cssVars['--filter-top-offset'] = `${this.$refs.header[0].offsetHeight}px`;
      console.log(`${this.$refs.header[0].offsetHeight}px`);
      this.$store.commit('override_table_option', {'cssVariables': cssVars});


    })
  },
  computed: {
    table_data(){
      return this.$store.state.sortedData.data.map((row, row_index) => {
        let result = {};
        for(let key in row){
          if(this.table_options.formatter[key]){
            result[key] = this.table_options.formatter[key](row[key], row_index, this.get_state, this.get_getters);
          }
          else{
            result[key] = row[key];
          }
        }
        return result;
      }).filter((row, row_index, table_data) => {
        let filter = this.table_options.filters;
        let result = [];
        if(filter && filter.matchFilter){          
          for(let key in filter.matchFilter){
            if(filter.matchFilter[key]){
              if(typeof filter.matchFilter[key] === 'string' || filter.matchFilter[key] instanceof RegExp){
                result.push(row[key].toString().toLowerCase().match(filter.matchFilter[key]));
              } 
              else if(typeof filter.matchFilter[key] === 'function'){
                result.push(filter.matchFilter[key](row[key], row_index, table_data));
              }
            }
          }
        }
        return result.reduce(
          (collector, current) => (filter.connection_operation === 'and' ? collector && current : collector || current), filter.connection_operation === 'and' ? true : false
        );
      });
    },
    table_options(){     /*: () => (this.$store.state.tableOptions),*/
      return this.$store.state.tableOptions;
    },
    header_fields(){
      return this.$store.getters.get_header_list;
    },
    sortability(){
      return this.$store.getters.get_sortability;
    },
    cssVariables(){
      console.log({css: this.$store.state.tableOptions.cssVariables})
      return this.$store.state.tableOptions.cssVariables;
    },
    sort_arrow(){
      let secondary_key = '';
      let secondary_key_pos = 0;

      for(let i = this.$store.state.sortedData.previousSorts.length - 1; i >= 0; i--){
        if(this.$store.state.sortedData.previousSorts[i] !== this.$store.state.sortedData.currentSortKey){
          secondary_key = this.$store.state.sortedData.previousSorts[i];
          secondary_key_pos = i;
          break;
        }
      }

      return {
        key: this.$store.state.sortedData.currentSortKey, 
        dir: this.$store.state.sortedData.currentSortDir,
        secondary_key: secondary_key,
        secondary_dir: this.$store.state.sortedData.previousSort_dirs[secondary_key_pos],
      };
    }
  },
  methods: {
    sortClick(event, header_key){
      this.$store.dispatch('sort_action', header_key);
    },
    input_changed(event, col){
      try {
        Vue.set(this.filter_inputs, col, this.table_options.filters.inputRegExp ? RegExp(event.srcElement.value, 'gim') : event.srcElement.value);
      }
      catch(err){
        console.error(err);
      }
      this.$store.commit('replace_match_filter', this.filter_inputs);
    },
    get_state(){
      return this.$store.state;
    },
    get_getters(){
      return this.$store.getters;
    },
  }
}
</script>



<style scoped>

#prot_table{
  display: grid;
  position: relative;
  grid-template-rows: auto;
  overflow-x: auto;
  box-sizing: border-box;  
  border: var(--table-border);
  align-content: start;
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
