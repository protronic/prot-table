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
export default {
  name: "protVueTable",
  data: function(){
    return {
      
    };
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
      });
    },
    table_options(){
      return this.$store.state.tableOptions;
    },
    header_fields(){
      return this.$store.getters.get_header_list;
    },
    sortability(){
      return this.$store.getters.get_sortability;
    },
    cssVariables(){
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
    get_state(){
      return this.$store.state;
    },
    get_getters(){
      return this.$store.getters;
    }
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
