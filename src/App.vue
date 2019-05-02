<template>
  <div id="app" ref="app">
    <prot-vue-table></prot-vue-table>

  </div>
</template>

<script>
import store from "./store/index";
import protVueTable from "./components/Table.vue";
import console from 'core-js';

export default {
  name: 'app',
  components: {
    protVueTable
  },
  store: store,
  mounted: function(){
    this.$store.dispatch('fetch_table_data', this.data_url ? this.data_url : 'data.json'); // data.json for normal build. 
    this.$store.commit('override_table_option', this.transform_options);
  },
  props: {
    /**
     * Url where the data can be fetched from. Has to be a json file and formatted by row. 
     * example: 
     *      [
              {
                "_id": "5bbd026039520dabb1a14e06",
                "index": 0,
                "isActive": false,
                "first": "Ruby",
                "last": "Joyce",
                "company": "INJOY",
                "address": "224 Jefferson Street, Talpa, New Mexico, 9637"
              },
              {
                "_id": "5bbd026056e4b8e1a7da0bdd",
                "index": 1,
                "isActive": false,
                "first": "Ann",
                "last": "Griffith",
                "company": "INJOY",
                "phone": "+1 (828) 486-2051",
                "address": "739 Lott Place, Carrizo, Minnesota, 7189"
              }
            ]
     * would translate to 2 rows and 8 columns.
     */
    data_url: String,

    /** 
     * options can either be an Object or a json string with the following propertys:
     * - height?: [String, Number] - can be a string like ['1em', '2px', '100%', 'auto', ...] or a number. If number, px is assumed.
     * - sortability?: Object - object where the keys are the header keys and the value is one of ['abc', '123', 'auto', function compareFn(a, b){...}]. 
          Where auto means I'm trying to assume what type it is (maybe slow, but the default option, either number (123) or letter (abc) sorted) and 
          CompareFn defines a custom sort order where a and b are two values and the function describes how to compare values (returns one of [-x, 0, x], where x is any number > 0). 
     * - tableStyles?: Object - styles that apply to the whole table. In object notation. exmpl.: {'border': '1px solid black', 'border-radius': '5px'}
     * - headerStyles?: Object - like tablestyles but applys only to header fields.
     * - bodyStyles?: Object - like tablestyles and headerStyles but applys only to body fields.
     * - colStyles?: Object - styles that apply only to specific columns. keys are the header fields and values are style objects like in tableStyles. Style does not apply to
     *    header (TODO decide if that is necassary maybe optional).
     * - rowStyles?: Array - an array of objects containing the following propertys:
          - check_row: function(rowValues, rowIndex, vuexState, vuexGetters){...}: Function - a function, deciding if a row applys for this style. Should only return one of [true, false].
          - styles: Object - style Object that applys only to rows where check_row returned true.
          If different rowStyles overlap the last in the rowStyle Array has priority.
     * - formatter?: Object - keys are the header keys. value is a function in the form: function(value, rowIndex, vuexState, vuexGetters){...} that gets called for
          every body field in the specified (key) column. Can be used for display format changes or calculations on the table data.
     * - cssVariables?: Object - css variables can, if needed, be overridden. Pass an Object with the variable names as keys and desired style as value.
          css Variables should be overridden by the defined styles (tableStyles, headerStyles, ...) because they are supposed to be inline. So for small theme changes use 
          css Variables and for deeper changes the style Objects.
          Defined Variables with defaults after colon and usage above:
          
          Backgrounds:
          --header-background: #f2f2f2;
          --body-even-background: #ffffff;
          --body-odd-background: #f2f2f2;

          Color:
          --table-font-color: #2c3e50;
          --header-font-color: #2c3e50;
          --body-even-font-color: #2c3e50;
          --body-odd-font-color: #2c3e50;

          Borders:
          --table-border: 1px solid lightgray;
          --header-field-border: 1px solid lightgray;
          --body-field-border: 1px solid lightgray;

          Font-Family:
          --table-font-family: 'Avenir', Helvetica, Arial, sans-serif; 

          Sort-Arrow-Style:
          --arrow-1-border: solid darkgray;
          --arrow-2-border: solid lightgray;
          --arrow-width: 0px 3px 3px 0px;

          format example: 
          {
            "--table-border": "1px solid black",
            "--header-field-border": "1px solid black",
          }
     * - dontShowCols?: Array<String> - an Array of header fields, is hidden by default.
     * - filters?: Object - has the following properties:
     *    - connection_operation: String - should be one of ['and', 'or']. How the different filters are connected. 'and' only shows rows that satisfy all filters,
     *    'or' shows rows that satisfy any of the filters.
     *    - matchFilter: Object - keys are the header keys. values are Regex or String or Callback. These are used to match the data. If a filter doesn't exist / is 
     *    falsly for an header key, it is ignored. Both Regex and String are used with fieldValue.toString().toLowerCase().match(...). Callback is in the form: 
     *    function(value, index, table_data){...}, should return either true or false and cycles through all entries of the key-column.
     *    - matcherType?: String - one of ['regexp', 'string', 'function']. Optional not in use.
     *    - showInputs: Boolean - if true, shows a row with input elements to define filters on the fly.
     *    - inputRegExp?: Boolean - if true, values typed in the input fields get transformed into RegExp with RegExp(string), otherwise they are not changed.
     *    - inputStyles?: Object - keys are the header keys. values are style Objects. for the input fields.
     *    - divStyles?: Object - keys are the header keys. values are style Objects. for the divs around the input fields.
     * TODO maybe: - headerDef?: Object - could be an Object describing header keys. Right now headers are extracted from data.
     *    could have Options like:
     *    - displayName?: String - display this instead of header_key.
     *    - fixWidth?: [String, Number] - set a fixed width for a column. Could also be a part of colStyles.
    */
    options: [Object, String],
  },
  computed: {
    transform_options(){
      return typeof this.options === 'string' ? JSON.parse(this.options) : this.options;
    },
    table_options(){
      return this.$store.state.tableOptions;
    }
  },
  methods: {

  },
}
</script>

<style>
/* Variable Definitions */
#app {
  /* Backgrounds: */
  --header-background: #f2f2f2;
  --body-even-background: #ffffff;
  --body-odd-background: #f2f2f2;

  /* Color: */
  --table-font-color: #2c3e50;
  --header-font-color: #2c3e50;
  --body-even-font-color: #2c3e50;
  --body-odd-font-color: #2c3e50;

  /* Border: */
  --table-border: 1px solid lightgray;
  --header-field-border: 1px solid lightgray;
  --body-field-border: 1px solid lightgray;

  /* Font-Family: */
  --table-font-family: 'Avenir', Helvetica, Arial, sans-serif; 

  /* Sort-Arrow-Style: */
  --arrow-1-border: solid darkgray;
  --arrow-2-border: solid lightgray;
  --arrow-width: 0px 3px 3px 0px;

  /* Filter: */
  --filter-top-offset: 0px;
}

#app {
  font-family: var(--table-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--table-font-color);
  margin: 10px;
}

</style>
 