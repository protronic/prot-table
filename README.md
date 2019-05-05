# prot-table

## Description

A customizable table component in vue. Intended to be used as a web-component or as a component in vue projects.

## Installation

Install dependencies:

```npm install```

Build as Web-Component:

```
vue-cli-service build --mode production --dest dist/web-component --target wc --name prot-table && cp public/demo.html dist/index.html && cp public/data.json dist/data.json
```

## Usage 

### Use as Web-Component

Include Vue and the Component:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js"></script>
<script src="./web-component/prot-table.js"></script>
```

Use the `<prot-table></prot-table>` tag with appropriate attributes:

```html
<prot-table id="p1" data_url="data.json"></prot-table>
```

or create it from within javascript

```
let p = document.createElement('prot-table');
p.setAttribute('data_url', 'data.json');
document.body.append(p);
```

In order to change the appearance you can provide them via the `table_options` property.

```javascript
  let p1 = document.createElement('prot-table')
  p1.setAttribute('data_url', "data.json");
  p1.table_options = {
    'height': '400px',
    'sortability': {
      'address': (a, b) => (Number(a.address.split(' ').pop()) - Number(b.address.split(' ').pop()))
    },
    'tableStyles': {},
    'headerStyles': {'font-weight': 'bold'},
    'bodyStyles': {},
    'rowStyles': [{
      check_row: (rowValues /*, rowIndex, vuexState, vuexGetters */ ) => ((rowValues['company'] && rowValues['company'] === 'INJOY') ? true : false),
      styles: {'background': 'lightgreen'}
    },{
      check_row: (rowValues /*, rowIndex, vuexState, vuexGetters */ ) => ((rowValues['index'] && rowValues['index'] > 40) ? true : false),
      styles: {'background': 'lightblue'}
    }],
    'colStyles': {'address': {'text-align': 'right'}},
    'formatter': {
      'index': (value /*, rowIndex, vuexState, vuexGetters */ ) => ((value < 10) ? `0${value}` : value),
      'isActive': (value /*, rowIndex, vuexState, vuexGetters */ ) => ((value) ? 'yes' : 'no'),
      'address': (value) => ((value) ? value.split(',').map( token => ((token.match(/\s[0-9]{3,4}/gm) ? `<span style="color: red;">${token}</span>` : token))).join(',') : '')
    },
    'cssVariables': {'--header-background': 'white'},
    'dontShowCols': ['_id'],
    'filters': {
      'connection_operation': 'and',
      'matchFilter': {},
      'inputRegExp': true,
      'showInputs': true,
    },
    'headerDef': {
      'index': {
        'displayName': 'Index',
        // 'fixWidth': '300px'
      },
      'isActive': {
        'displayName': 'Aktiv',
      },
      'first': {
        'displayName': 'Vorname',
      },
      'last': {
        'displayName': 'Nachname',
      },
      'company': {
        'displayName': 'Firma',
      },
      'address': {
        'displayName': 'Adresse',
      },
      'phone': {
        'displayName': 'Telefon',
      },
    }
  };
  document.body.append(p1);
```

### Propertys

#### `data_url: String`

Url where the data can be fetched from. Data_url gets ignored when data property is set.

#### `data: [Array, String]`

A json string or an array of objects representing the table data grouped by rows.

#### `table_options: [Object, String]`

A json string or an object for all the table options. 

* `height?: [String, Number]` - can be a string like `['1em', '2px', '100%', 'auto', ...]` or a number. If number, px is assumed.
* `sortability?: Object` - object where the keys are the header keys and the value is one of `['abc', '123', 'auto', function compareFn(a, b){...}]`. Where auto means prot-table is trying to assume what type it is (maybe slow, but the default option, either number (123) or letter (abc) sorted) and CompareFn defines a custom sort order where a and b are two values and the function describes how to compare values (returns one of `[-x, 0, x]`, where x is any number > 0). 
* `tableStyles?: Object` - styles that apply to the whole table. In object notation. exmpl.: `{'border': '1px solid black', 'border-radius': '5px'}`
* `headerStyles?: Object` - like tablestyles but applys only to header fields.
* `bodyStyles?: Object` - like tablestyles and headerStyles but applys only to body fields.
* `colStyles?: Object` - styles that apply only to specific columns. keys are the header fields and values are style objects like in tableStyles. Style does not apply to header (TODO decide if that is necassary maybe optional).
* `rowStyles?: Array` - an array of objects containing the following propertys:
  * `check_row: function(rowValues, rowIndex){...}: Function` - a function, deciding if a row applys for this style. Should only return one of `[true, false]`.
  * `styles: Object` - style Object that applys only to rows where check_row returned true. If different rowStyles overlap the last in the rowStyle Array has priority.
* `formatter?: Object` - keys are the header keys. value is a function in the form: `function(value, rowIndex, vuexState, vuexGetters){...}` that gets called for every body field in the specified (key) column. Can be used for display format changes or calculations on the table data.
* `cssVariables?: Object` - css variables can, if needed, be overridden. Pass an Object with the variable names as keys and desired style as value. css Variables should be overridden by the defined styles (tableStyles, headerStyles, ...) because they are supposed to be inline. So for small theme changes use css Variables and for deeper changes the style Objects. Defined Variables are at the bottom of this file.

          format example: 
          {
            "--table-border": "1px solid black",
            "--header-field-border": "1px solid black",
          }
    
* `dontShowCols?: Array<String>` - an Array of header fields, is hidden by default.
* `filters?: Object` - has the following properties:
  * `connection_operation: String` - should be one of `['and', 'or']`. How the different filters are connected. 'and' only shows rows that satisfy all filters, 'or' shows rows that satisfy any of the filters.
  * `matchFilter: Object` - keys are the header keys. values are Regex or String or Callback. These are used to match the data. If a filter doesn't exist / is falsly for an header key, it is ignored. Both Regex and String are used with `fieldValue.toString().toLowerCase().match(...)`. Callback is in the form: `function(value, index, table_data){...}`, should return either true or false and cycles through all entries of the key-column.
  * `matcherType?: String` - one of `['regexp', 'string', 'function']`. Optional not in use.
  * `showInputs: Boolean` - if true, shows a row with input elements to define filters on the fly.
  * `inputRegExp?: Boolean` - if true, values typed in the input fields get transformed into RegExp with `RegExp(string)`, otherwise they are not changed.
  * `inputStyles?: Object` - keys are the header keys. values are style Objects. for the input fields.
  * `divStyles?: Object` - keys are the header keys. values are style Objects. for the divs around the input fields.
* `resizable?: Boolean` - true should give the user the option to resize columns.
* `headerDef?: Object` - keys are the keys used in data. Value is an Object describing header keys. If set, the headers are not extracted from data -> should be faster. Has these Options:
  * `displayName?: String` - display this instead of header_key.
  * `fixWidth?: String` - set a fixed width for a column.
     
