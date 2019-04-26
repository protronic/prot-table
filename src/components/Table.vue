<template>
  <div id="prot_table" :style="{'grid-template-rows': 'repeat(' + (table_data.length + 1) + ', auto)'}">
    <div :class="['header_field', 'header_col_' + i]" v-for="(key, i) in live_header_fields" :key="key" v-html="key"></div>
    <template 
      v-for="(col, i) in live_header_fields"
    >
      <div 
        v-for="(row, j) in table_data" 
        :key="'row' + j + 'col' + i" 
        :class="['body_field', 'body_field_row_' + j, 'body_field_col_' + i]"
        v-html="row[col]"
        :style="{'grid-row': j + 2}"
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
  },
  computed: {
    live_header_fields: function(){
      let header_fields = this.table_data.reduce((collector, current) => {
        for (let i in Object.keys(current)){
          if (!collector.includes(Object.keys(current)[i])) 
            collector.push(Object.keys(current)[i])
        }
        return collector;
      }, []);
      console.log({data: this.table_data, header: this.header_fields});
      return header_fields;
    },
  }

}
</script>



<style scoped>

#prot_table{
  display: grid;
  grid-template-rows: auto;
}

.header_field, .body_field {
  border: 1px solid lightgray;
}

.header_field{
  grid-row: 1;
}

</style>
