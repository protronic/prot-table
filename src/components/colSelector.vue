<template>
  <div class="dropdown">
    <button @click="toggle()" class="dropbtn">Spalten</button>
    <div class="parent">
      <ul ref="dropdown" v-show="show" :class="['dropdown-content', get_class]" :style="{'max-height': '900px', 'white-space': 'nowrap', 'display': 'block'}">
        <li v-for="item in all_columns" :key="item"><input type="checkbox" :checked="!unchecked_columns.includes(item)" :value="item" @change="value_changed(item, $event)" class="dropdown-chkbox"> {{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'col-selector',
  mounted(){
    
  },
  data: function(){
    return {
      show: true,
      dropdown_height: 0,
      top_offset: 0,
      unchecked_columns: [],
      initial_show: true,
    };
  },
  props: {
    all_columns: Array,
    table_height: Number,
    // show_dropdown: Boolean,
  },
  computed: {
    get_class(){
      return this.table_height - this.dropdown_height < 15 ? 
        'down' :
        'up';
    },
  },
  methods:{
    toggle(){
      this.show = !this.show;
      // if(this.show){
      //   this.dropdown_height = document.querySelector('.dropdown-content').clientHeight > 0 ? document.querySelector('.dropdown-content').clientHeight : this.dropdown_height; //this.$refs.dropdown.clientHeight;
      // }
    },
    value_changed(col_changed, event){
      event.stopPropagation();
      console.log(col_changed, event.target.checked);
      this.$emit('column_show_toggle', col_changed, event.target.checked);
    }
  },
  watch: {
    // unchecked_columns: function(newValue){
    //   // newValue.forEach(element => {
    //   //   // setTimeout(()=>{
    //   //   //   this.value_changed(element, false)
    //   //   // }, 0);
    //   // });
    // },
    table_height: function(newValue){
      // if(!this.isMounted) return;
      // let d = //document.querySelector('.dropdown-content')
      let d = this.$refs.dropdown;
      this.dropdown_height = d.clientHeight < this.dropdown_height ? this.dropdown_height : d.clientHeight;
      this.top_offset = d.offsetTop;
      // this.show = false;
      if(this.initial_show) {
        // setTimeout(()=> {
        this.$nextTick(() => {
          this.show = false;
          this.initial_show = false;
        })
        // }, 0)
      }
    }
  }
}
</script>

<style>

  :host {
    overflow-y: visible;
  }

  .dropbtn {
    -moz-box-shadow:inset 0px 1px 0px 0px #94989c;
    -webkit-box-shadow:inset 0px 1px 0px 0px #94989c;
    box-shadow:inset 0px 1px 0px 0px #94989c;
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #e0e0e0), color-stop(1, #cccccc));
    background:-moz-linear-gradient(top, #e0e0e0 5%, #cccccc 100%);
    background:-webkit-linear-gradient(top, #e0e0e0 5%, #cccccc 100%);
    background:-o-linear-gradient(top, #e0e0e0 5%, #cccccc 100%);
    background:-ms-linear-gradient(top, #e0e0e0 5%, #cccccc 100%);
    background:linear-gradient(to bottom, #e0e0e0 5%, #cccccc 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#e0e0e0', endColorstr='#cccccc',GradientType=0);
    background-color:#e0e0e0;
    -moz-border-radius:6px;
    -webkit-border-radius:6px;
    border-radius:6px;
    border:  1px solid grey;
    display:inline-block;
    cursor:pointer;
	  color:#5c5c5c;
    margin-left: 50px;
    /* padding:6px 24px; */
    text-decoration:none;
    text-shadow:0px 1px 0px #696e73;
    height: 100%;
    vertical-align: middle;
  }
  
  .dropbtn:hover {
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #cccccc), color-stop(1, #878787));
    background:-moz-linear-gradient(top, #cccccc 5%, #878787 100%);
    background:-webkit-linear-gradient(top, #cccccc 5%, #878787 100%);
    background:-o-linear-gradient(top, #cccccc 5%, #878787 100%);
    background:-ms-linear-gradient(top, #cccccc 5%, #878787 100%);
    background:linear-gradient(to bottom, #cccccc 5%, #878787 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#cccccc', endColorstr='#878787',GradientType=0);
    background-color:#cccccc;
  }

  .dropbtn:active {
    position:relative;
    top:1px;
  }

  .dropdown {
    position: relative;
    display: inline-block;
    overflow: visible;
  }

  .dropdown-content.up {
    bottom: -1em;
  }

  .dropdown-content.down {
    top: 0.5em;
  }

  .parent {
    position: absolute;
    top: 0px;
    left: 0px;
    overflow: visible;
  }

  .dropdown-content {
    display: block;
    position: absolute;
    /* width: calc(100% + 2em); */
    border-radius: 10px;
    background-color: #f1f1f1;
    border: 1px solid gray;
    box-shadow: 4px 0px 16px 4px rgba(0,0,0,0.2);
    z-index: 100;
    list-style: none;
    /* bottom: var(--table-height); */
    text-align: left;
    padding: 5px;
    /* overflow: visible; */
  }

  .dropdown-chkbox {
    border-radius: 5px;
  }

</style>
