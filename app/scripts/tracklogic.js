//'use strict';

function callUpload(){
  Webcam.reset();
  //reset the DOM back too. Because this douche-bag of a plugin scattered everything.
  $(".demo_container").html("<img id='user_blob'/>");
  $(".demo_container").removeAttr("style");
  $("#file").trigger('click');

  var scope = angular.element(document.querySelector(".hero")).scope();
  scope.start = true;
  scope.webcam = false;
  scope.$apply();
}

function callWebcam(){
  Webcam.set({
       width: 640,
       height: 480,
       dest_width: 640,
       dest_height: 480,
       image_format: 'png',
       jpeg_quality: 100,
       force_flash: false,
       flip_horiz: true,
       fps: 45
   });

   //hide the label instructiosn for chooisng an image and show the one for using the webcam instead
   var scope = angular.element(document.querySelector(".hero")).scope();
   scope.start = false;
   scope.webcam = true;
   scope.$apply();

  Webcam.attach('#webcam_holder');
}

function takeWebcamPicture(){
  Webcam.snap( function(data_uri) {
    document.getElementById('user_blob').src = data_uri;
  } );

  Webcam.reset();

  //hide the webcam holder this time
  var scope = angular.element(document.querySelector(".hero")).scope();
  scope.start = false;
  scope.webcam = false;
  scope.$apply();

  $('#user_blob').faceDetection({
     complete: function (faces) {
        console.log(faces.length);
         completed(faces);
     }
  });
}

var element = $("#in-avatar-preview-area"); // global variable
var getCanvas;

function downloadStuff(){
  var imgageData = getCanvas.toDataURL("image/png");
  // Now browser starts downloading it instead of just showing it
  var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
  $("#in-share-btn").attr("download", "your_pic_name.png").attr("href", newData);
}

$("#in-share-btn").on('click', function () {
         html2canvas(element, {
         onrendered: function (canvas) {
                //$("#previewImage").append(canvas);
                getCanvas = canvas;
                downloadStuff();
             }
         });

});

function realDownload(){
  /*html2canvas(element).then(function(canvas) {
    getCanvas = canvas;
    downloadStuff();
  });*/

  html2canvas($("#in-avatar-preview-area"), {
  onrendered: function (canvas) {
         //$("#previewImage").append(canvas);
         getCanvas = canvas;
         downloadStuff();
      }
  });
}


function showTracker(){
  var img = document.getElementById('user_blob');
  var tracker = new tracking.ObjectTracker('face');
  //var tracker = new tracking.ObjectTracker(['face', 'eye', 'mouth']);
  tracker.setStepSize(1.7);
  tracking.track('#user_blob', tracker);
  tracker.on('track', function(event) {
    event.data.forEach(function(rect) {
      window.plot(rect.x, rect.y, rect.width, rect.height);
    });
  });

  window.plot = function(x, y, w, h) {
    var rect = document.createElement('div');
    document.querySelector('.demo_container').appendChild(rect);
    rect.classList.add('rect');
    rect.style.width = w + 'px';
    rect.style.height = h + 'px';
    rect.style.left = (img.offsetLeft + x) + 'px';
    rect.style.top = (img.offsetTop + y) + 'px';
  };
}

function completed(faces) {
          var marg = 20;
          var scope = angular.element(document.querySelector(".hero")).scope();

          //var p = $('#user_blob').parent().position();
          var w = $('#user_blob').parent().width();
          var h = $('#user_blob').parent().height();

          scope.imgWidth = w;
          scope.imgHeight = h;
          //$('.imgareaselect-selection').closest('div').remove();
          //$('.imgareaselect-outer').remove();

          //$('.face-img').remove();

          if(faces.length == 0){

            scope.facescount = 0;
            scope.start = false;
            scope.webcam = false;
            scope.$apply();
            $('#user_blob').cropper('destroy');
            $('#user_blob').cropper({
              //aspectRatio:2/3,
              movable: false,
              scalable: false,
              rotatable: false,
              zoomable: false,
              crop: function(e) {
                // Output the result data for cropping image.
                console.log(e.x);
                console.log(e.y);
                console.log(e.width);
                console.log(e.height);
                scope.x1 = e.x;
                scope.y1 = e.y;
                scope.x2 = e.width;
                scope.y2 = e.height;
                scope.$apply();
                //console.log(e.rotate);
                //console.log(e.scaleX);
                //console.log(e.scaleY);
              }
            });


            /*$('#user_blob').imgAreaSelect({
              onSelectEnd: function (img, selection) {
                    scope.continue = true;
                    scope.x1 = selection.x1;
                    scope.y1 = selection.y1;
                    scope.x2 = selection.x2;
                    scope.y2 = selection.y2;


                    //scope.x1 = p.left;
                    //scope.y1 = p.top;
                    //scope.x2 = w;
                    //scope.y2 = h;
                    scope.$apply();
                }
            });*/

          } else if(faces.length == 1){
            //facescount = 1;
            scope.facescount = 1;
            scope.start = false;
            scope.webcam = false;
            scope.$apply();

            var left   = (faces[0].x - marg),
                top    = (faces[0].y - marg),
                width  = (faces[0].width  + (marg * 2)),
                height = (faces[0].height + (marg * 2));

                $('<div />', {
                    'class': 'face-img-o',
                    'css': {
                        'left':   left   * faces[0].scaleX + 'px',
                        'top':    top    * faces[0].scaleY + 'px',
                        'width':  width  * faces[0].scaleX + 'px',
                        'height': height * faces[0].scaleY + 'px'
                    }
                }).appendTo(".demo_container");

            var p = $('.face-img-o').position();
            var w = ($('.face-img-o').width() + p.left);
            var h = ($('.face-img-o').height() + p.top);

            var wII = ($('.face-img-o').width());
            var hII = ($('.face-img-o').height());

            //set CreateController.continue to also true here, incase the onSelectEnd doesn't fire

            //scope.continue = true;
            //scope.$apply();

            $('#user_blob').cropper('destroy');
            $('#user_blob').cropper({
              //aspectRatio:2/3,
              movable: false,
              scalable: false,
              rotatable: false,
              zoomable: false,
              crop: function(e) {
                // Output the result data for cropping image.
                console.log(e.x);
                console.log(e.y);
                console.log(e.width);
                console.log(e.height);
                scope.x1 = e.x;
                scope.y1 = e.y;
                scope.x2 = e.width;
                scope.y2 = e.height;
                scope.$apply();

                //console.log(e.rotate);
                //console.log(e.scaleX);
                //console.log(e.scaleY);
              }
            });

            //$('#user_blob').cropper('setData', {"x":p.left,"y":p.top,"width":wII,"height":hII});
            $('#user_blob').cropper('setCropBoxData', {"left":p.left,"top":p.top,"width":wII,"height":hII});

            /*$('#user_blob').imgAreaSelect({ x1: p.left, y1: p.top, x2: w, y2: h,
              onSelectEnd: function (img, selection) {
                    scope.continue = true;
                    scope.x1 = selection.x1;
                    scope.y1 = selection.y1;
                    scope.x2 = selection.x2;
                    scope.y2 = selection.y2;
                    scope.$apply();
                }
              });*/
            //<div class="face-img" style="left: 204.518px; top: 293.861px; width: 186.89px; height: 186.89px;"></div>
            //$('#user_blob').imgAreaSelect({});
            //alert("One");


          } else if (faces.length > 1) {
            scope.facescount = faces.length;
            scope.start = false;
            scope.webcam = false;
            scope.$apply();

            $('#user_blob').cropper('destroy');
            $('#user_blob').cropper({
              //aspectRatio:2/3,
              movable: false,
              scalable: false,
              rotatable: false,
              zoomable: false,
              crop: function(e) {
                // Output the result data for cropping image.
                console.log(e.x);
                console.log(e.y);
                console.log(e.width);
                console.log(e.height);
                scope.x1 = e.x;
                scope.y1 = e.y;
                scope.x2 = e.width;
                scope.y2 = e.height;
                scope.$apply();
                //console.log(e.rotate);
                //console.log(e.scaleX);
                //console.log(e.scaleY);
              }
            });

            /*$('#user_blob').imgAreaSelect({
              onSelectEnd: function (img, selection) {
                    scope.continue = true;
                    scope.x1 = selection.x1;
                    scope.y1 = selection.y1;
                    scope.x2 = selection.x2;
                    scope.y2 = selection.y2;
                    scope.$apply();
                }
            });*/

            /*for (var i = 0; i < faces.length; i++) {
                var left   = (faces[i].x - marg),
                    top    = (faces[i].y - marg),
                    width  = (faces[i].width  + (marg * 2)),
                    height = (faces[i].height + (marg * 2));

                $('<div />', {
                    'class': 'face-img',
                    'css': {
                        'left':   left   * faces[i].scaleX + 'px',
                        'top':    top    * faces[i].scaleY + 'px',
                        'width':  width  * faces[i].scaleX + 'px',
                        'height': height * faces[i].scaleY + 'px'
                    }
                }).appendTo(".demo_container");

                /*var $div = $('<div />', {
                    'class': 'portrait',
                    'css': {
                        'background-image': 'url(' + $img.attr('src') + ')',
                        'background-position': -left + 'px ' + -top + 'px'
                    }
                }).on('click', function(e) {
                    e.preventDefault();

                    $('.portrait').fadeOut('fast', function() {
                        $(this).remove();

                        initFaces();
                    });
                }).appendTo('#portraits');

                (function($div, i) {
                    setTimeout(function() {
                        $div.addClass('animated swing');
                    }, 100 * i);
                })($div, i);
            }*/
          }

          console.log(scope.facescount);
          console.log(scope.files.length);
      }

function showPreview(element) {
    NProgress.start();
    var input = element;

    //let's hold the files in Angular
    var scope = angular.element(document.querySelector(".hero")).scope();
      scope.$apply(function () {
                // STORE THE FILE OBJECT IN AN ARRAY.
                for (var i = 0; i < input.files.length; i++) {
                    scope.files.push(input.files[i]);
                }
      });


    var holder = parent.document.getElementById('user_blob');
    //holder.innerHTML = "";
    var i;
    var image = new Image();
    var w, h;
    var wrong = false;

    if (input.files) {

        for (i = 0; i < input.files.length; i++) {
            var oFReader = new FileReader();
            oFReader.readAsDataURL(input.files[i]);
            oFReader.onload = function (oFREvent) {
                //var preview = document.createElement("div");
                //preview.className = "previewUploads";
                image.src = oFREvent.target.result;
                image.onload = function () {
                    w = this.width;
                    h = this.height;
                    //t = input.files[i].type,                           // ext only: // file.type.split('/')[1],
                    //n = input.files[i].name,
                    //s = ~ ~(file.size / 1024) + 'KB';
                    holder.src = oFREvent.target.result;
                    //showTracker();
                    $('#user_blob').faceDetection({
                       complete: function (faces) {
                          console.log(faces.length);
                           completed(faces);
                       }
                    });
                   NProgress.done();
                };


                //holder.appendChild(preview);
            };
            /*if (wrong) {
               $('.tabheader .content').html("Wrong Image Dimensions");
                $('.dialogcontent').html("<div style='padding:15px'>Sorry but the image has to have a width of 284px and a height of 346px</div>");
                $('.md-modal').addClass('md-show');
            }*/

        }
    }

}
