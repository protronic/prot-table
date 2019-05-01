<template>
  <div 
    id="prot_table" 
    ref="prot_table"
    :style="{
      'grid-template-rows': 'repeat(' + (table_data.length + 1) + ', auto)', 
      'height': typeof height === 'number' ? height + 'px' : height,
      'overflow-y': height === 'auto' || height === undefined ? 'auto' : 'scroll',
    }"
  >
    <div 
      v-for="(key, i) in live_header_fields" 
      :class="['header_field', 'header_col_' + i]" 
      :key="key" 
      v-html="key"
    ></div>
    <template 
      v-for="(col, i) in live_header_fields"
    >
      <div 
        v-for="(row, j) in table_data" 
        :key="'row' + j + 'col' + i" 
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i]"
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
  props: {
    table_data: Array,
    height: [Number, String],
  },
  computed: {
    show_scrollbar_y: function(){
           
    },
    live_header_fields: function(){
      let header_fields = this.table_data.map( value => (Object.keys(value)) ).reduce( (collector, current) => {
        for (let i in current){
          if (!collector.includes(current[i])) 
            collector.push(current[i])
        }
        
        return collector;
      }
      , []);

      // console.log({data: this.table_data, header: this.header_fields});
      return header_fields;
    },
  }

}
</script>



<style scoped>

#prot_table{
  display: grid;
  grid-template-rows: auto;
  overflow-x: auto;
  position: relative;
  border: 1px solid lightgray;
  box-sizing: border-box;
  
}

.header_field, .body_field {
  border: 0.4px solid lightgray;
  box-sizing: border-box;
  padding: 5px;
}

.header_field{
  grid-row: 1;
  position: sticky;
  background: white;
  top: 0px;
  left: 0px;
}

</style>
