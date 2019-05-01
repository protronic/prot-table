<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <prot-vue-table :height="transform_options.height" :table_data="live_data"></prot-vue-table>
    <img alt="Vue logo" src="./assets/logo.png">
    <br>
    <img alt="Vue logo" src="./assets/logo.png">
    <br>
    <img alt="Vue logo" src="./assets/logo.png">
    <br>
  </div>
</template>

<script>
import protVueTable from "./components/Table.vue";
import console from 'core-js';

export default {
  name: 'app',
  components: {
    protVueTable
  },
  mounted: function(){
    this.getData();
  },
  data: function(){
    return {
      table_data: []
    };
  },
  props: {
    data_url: String,
    data: Array,
    options: [Object, String],
  },
  computed: {
    transform_options: function(){
      return typeof this.options === 'string' ? JSON.parse(this.options) : this.options;
    },
    live_data: function(){
      if(this.data){
        return this.data;
      }
      else{
        // console.log({data_given: this.table_data})
        return this.table_data;
      }
      
    }
  },
  methods: {
    getData(){
      if(this.data_url) 
        fetch(this.data_url)
          .then( response => {
            if(response.ok) {
              return response.json();
            }
            else 
              throw `Got response ${response.status} from ${this.data_url}.`
          })
          .then( data => {
            this.table_data = data;
          })
          .catch( error => {
            console.error(error);
          });
    }
  },
}
</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

/* Variable Definition */
#app {
  
}
</style>
 