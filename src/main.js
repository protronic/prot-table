import Vue from 'vue';
import App from './App.vue';


Vue.config.productionTip = false


// new Vue({
//   render: h => h(App),
// }).$mount('#app');

new Vue({
  // render: h => h(App),
  mixins: [App],
}).$mount('#app');