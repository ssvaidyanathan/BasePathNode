var express    = require("express");        // call express
var app        = express();                 // define our app using express
var bodyParser = require("body-parser");
var request = require("request");
var https = require("https");
var Promise = require("promise");
var searchjs = require("searchjs");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 9000;        // set our port


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:9000/api)
router.get("/", function(req, res) {

    res.json({ message: "hooray! welcome to our api!" });   
});

router.route("/basepaths")

    // accessed at GET http://localhost:9000/api/basepath/:_path)
    .get(function(req, res) {

      getAllAPIs(req.get("X-Host"), req.get("X-Org"), req.get("Authorization"))
      .then(function(allAPIs){
        if(allAPIs.code >=400){
          res.statusCode = allAPIs.code;
          res.json({message: allAPIs.msg});   
        }
        var p = Promise.all(allAPIs.map(function(api){
          return getAPIRevision(req.get("X-Host"), req.get("X-Org"), req.get("Authorization"), api);
        }));
        p.catch(function(e){console.log("Catch handler for getAllAPIs" + e); return e;});
        return p;
      })
      .then(function(apiRevisions){
        var p = Promise.all(apiRevisions.map(function(apiRevision){
          return getAPIBasePath(req.get("X-Host"), req.get("X-Org"), req.get("Authorization"), apiRevision.api, apiRevision.revision);
        }));
        p.catch(function(e){console.log("Catch handler for apiRevisions" + e); return e;});
        return p;
      })
      .then(function(apisBasePath){
          var results= [];
          apisBasePath.forEach(function(a){
              results = results.concat(a);
          });
          //results.sort();
          //if(req.get("X-Order") === "desc"){
            //results.reverse();
          //}
          var final=[];
          results.forEach(function(result){
              var splitArr = result.split("^");
              var obj = {};
              obj.basepath = splitArr[0];
              obj.proxy = splitArr[1];
              final.push(obj);
          });
          //console.table(final);
          if(req.query.search != null){
            var matches = searchjs.matchArray(final,{basepath:req.query.search,_text:true});
            res.json(matches);
          }else{
            res.json(final); 
          }
      });
    }); 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use("/", router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);


//Call Mgmt API
function mgmtAPI(host, path, auth, type){
  return new Promise(function (fulfill, reject){



    var data = "";
    var options = {
      host: host,
      port: 443,
      path: path,
      method: type,
      headers: {
          Accept: "application/json",
          Authorization: auth
      }
    };
    var req = https.request(options, function(res) {
      if (res.statusCode >= 400 && res.statusCode <= 499) {
        console.error(res.statusCode + ": " + res.statusMessage + " with " + JSON.stringify(options));
        //throw new Error(res.statusCode + ": " + res.statusMessage + " with " + JSON.stringify(options));
      }
      if (res.statusCode >= 500) {
        console.error(res.statusCode + ": " + res.statusMessage + " with " + JSON.stringify(options));
      }
      res.on("data", function(d) {
          data += d;
      });
      res.on("end", function(){
        if(res.statusCode === 200)
          fulfill(JSON.parse(data));
        else{
          var errorBody = {
            code: res.statusCode,
            msg: res.statusMessage
          }
          fulfill(errorBody);
        }
      });
    });

    req.on("error", function(e) {
      console.error(e);
    });

    req.end();
  });
}

function getMgmtAPI(host, path, auth){
  return mgmtAPI(host, path, auth, "GET");
}

//Get All APIs from Org
function getAllAPIs(host, org, auth){
  var allAPIs = getMgmtAPI(host, "/v1/o/"+org+"/apis", auth);
  return allAPIs;
}

//Get API Revisions
function getAPIRevision(host, org, auth, api){
  return getMgmtAPI(host, "/v1/o/"+org+"/apis/"+api, auth)
  .then(function(response){
    var revisions = response.revision;
    var obj = {};
    obj.api = api;
    obj.revision = revisions[revisions.length-1];
    return obj;
  })
  .catch(function(e){
    console.error("Catch handler getAPIRevision" + e);
  });
}

//Get API BasePath
function getAPIBasePath(host, org, auth, api, revision){
  return getMgmtAPI(host, "/v1/o/"+org+"/apis/"+api+"/revisions/"+revision, auth)
  .then(function(response){
    var obj = [];
    var basepath = response.basepaths;
    if(basepath.length === 1){
      obj.push(obj+basepath[0]+"^"+api);
      return obj;
    }
    else{
      basepath.forEach(function(b){
        obj.push(b+"^"+api);
      });
      return obj;
    }
  })
  .catch(function(e){
    console.error("Catch handler getAPIBasePath" + e);
  });
}
