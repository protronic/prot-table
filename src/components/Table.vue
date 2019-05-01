<template>
  <div 
    id="prot_table" 
    ref="prot_table"
    :style="{
      'grid-template-rows': 'repeat(' + (table_data.length + 1) + ', auto)', 
      'height': typeof table_options.height === 'number' ? table_options.height + 'px' : table_options.height,
      'overflow-y': table_options.height === 'auto' || table_options.height === undefined ? 'auto' : 'scroll',
    }"
  >
    <div 
      v-for="(key, i) in header_fields" 
      :class="['header_field', 'header_col_' + i]" 
      :key="key" 
      @click="sortClick($event, key)"
      v-html="key"
    ></div>
    <template 
      v-for="(col, i) in header_fields"
    >
      <div 
        v-for="(row, j) in table_data" 
        :key="'row' + j + 'col' + i" 
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i, j % 2 === 0 ? 'even_row' : 'odd_row']"
        :style="{'grid-row': j + 2}"
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
      // header_fields: [],
    };
  },
  computed: {
    table_data(){
      return this.$store.state.sortedData.data;
    },
    table_options(){
      return this.$store.state.tableOptions;
    },
    header_fields(){
      console.log(this.sortability)
      return this.$store.getters.get_header_list;
    },
    sortability(){
      return this.$store.getters.get_sortability;
    }
  },
  methods: {
    sortClick(event, header_key){
      console.log({ev: event, he: header_key});
      this.$store.dispatch('sort_action', header_key);
      setTimeout( () => {
        console.log(this.$store.state.sortedData);
      }, 1000) 
    }
  }
}
</script>



<style scoped>

#prot_table{
  display: grid;
  grid-template-rows: auto;
  overflow-x: auto;
  position: relative;
  border: var(--table-border);
  box-sizing: border-box;  
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

</style>
