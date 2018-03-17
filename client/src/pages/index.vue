<template>
  <div id="container" class="column">

    <div id="control" class="row no-wrap">

      <div class="col-auto col-auto">
        <div>
          <img id="control-logo" src="/statics/logos/logo2_light.png"/>
        </div>
        <div id="links">
          <!--
          <q-btn color="primary" size="md" flat>about</q-btn>
          <q-btn color="primary" size="md" flat>apply</q-btn>
          -->
          <a href="">about</a> -
          <a href="">apply</a> -
          <a href="">blog</a>
        </div>
      </div>

      <div id="spotlight" class="col row">
        <div class="col-auto">
            <img id="organization-logo" src="https://www.eff.org/sites/all/modules/custom/eff_library/images/eff-logo-stack-black.svg"/>
        </div>
        <div class="col">
          <i>123.123 XLM donated</i><br>
          <small>from 123 donations</small><br>
          <q-btn color="blue-9" size="sm">donate</q-btn>
        </div>
      </div>
      <div class="row items-end">
        <img style="height: 50px;" src="/statics/logos/astronaut_light.png"/>
      </div>
    </div>

    <div id="space" class="row">
      Space
    </div>
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'PageIndex'
}
</script>

<style>
  #container {
    height: 100vh;
    background: black;
  }
  #control {
    min-height: 150px;
    padding: 10px;
    background: rgb(51, 51, 60);
  }
  #control-logo {
    height: 75px;
  }
  #links {
    margin-top: 10px;
  }
  #links, #links a {
    color: #027be3;
  }
  #links a {
    padding: 0px 6px;
    text-decoration: none;
  }
  #links a:hover {
    text-decoration: underline;
  }
  #spotlight {
    margin-left: 200px;
    color: #e3e4ec;
  }
  #organization-logo {
    height: 120px;
    max-height: 120px;
    max-width: 200px;
  }
  #space {
    background: black;
    color: white;
  }
</style>
