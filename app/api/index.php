<?php
error_reporting(-1);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
date_default_timezone_set('UTC');

// Report all errors
//error_reporting(E_ALL);

try {
    // Initialize Composer autoloader
    if (!file_exists($autoload = __DIR__ . '/vendor/autoload.php')) {
        throw new \Exception('Composer dependencies not installed. Run `make install --directory app/api`');
    }
    require_once $autoload;

    // Initialize Slim Framework
    if (!class_exists('\\Slim\\Slim')) {
        throw new \Exception(
            'Missing Slim from Composer dependencies.'
            . ' Ensure slim/slim is in composer.json and run `make update --directory app/api`'
        );
    }

    // Run application
    $app = new \Api\Application();
    $app->post('/upload', 'uploadPicture');
    $app->post('/vote_user', 'voteUser');
    $app->post('/edit_picture', 'editPicture');
    $app->get('/users', 'getUsers');
    $app->get('/get_image', 'getImage');
    $app->get('/get_temp', 'showTmp');
    $app->get('/user', 'getUser');
    //$app->get('/user/:id', 'getUser');
    $app->run();

} catch (\Exception $e) {
    if (isset($app)) {
        $app->handleException($e);
    } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(array(
            'status' => 500,
            'statusText' => 'Internal Server Error',
            'description' => $e->getMessage(),
        ));
    }
}


function showTmp(){
  $tmp_dir = ini_get('upload_tmp_dir') ? ini_get('upload_tmp_dir') : sys_get_temp_dir();
  die($tmp_dir);
}

function getConnection()
{
    $dbhost="127.0.0.1";
    //$dbport="8889";
    $dbuser="root";
    $dbpass="";
    $dbname="indomie_contest";
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}

/*function getConnection()
{
    $dbhost="localhost";
    //$dbport="8889";
    $dbuser="getcentr_indomie";
    $dbpass="indomie";
    $dbname="getcentr_indomie";
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}*/


function editPicture(){
  $pattern = $_POST["m_pattern"];
  $numlevels = $_POST["m_numlevels"];
  $edgemethod = $_POST["m_edgemethod"];
  $edgeamount = $_POST["m_edgeamount"];
  $brightness = $_POST["m_brightness"];
  $saturation = $_POST["m_saturation"];

  $im_file = $_POST["m_file"];

  $former_file = $im_file;

  $im_file = realpath(__DIR__ . '/..') . "/images/assets/headers/" . $im_file;

  cartoonImage($im_file, 70, 6, 1, 4, 100, 150);

  $date = new DateTime();
  $timestamp = $date->getTimestamp();

  echo $former_file;// . "?" . $timestamp;
}

function getUsers(){
  $sql = "SELECT * FROM Users ORDER BY id";
  try{
    $db = getConnection();
    $stmt = $db->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    echo json_encode($users);
  }catch(PDOException $e){
    echo '{"error":{"text":'. $e->getMessage() .'}}';
  }
}

function getUser(){
  $id = $_GET["user_id"];
  $sql = "SELECT * FROM Users WHERE id = $id";
  try{
    $db = getConnection();
    $stmt = $db->query($sql);
    $user = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    echo json_encode($user);
  }catch(PDOException $e){
    echo '{"error":{"text":'. $e->getMessage() .'}}';
  }
}

function addUser($name, $reason, $image_url, $timestamp) {
  $sql = "INSERT INTO Users (Name, Reason, Image, TimestampValue) VALUES (:name, :reason, :image, :timestampvalue)";
  try {

    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->bindParam("name", $name);
    $stmt->bindParam("reason", $reason);
    $stmt->bindParam("image", $image_url);
    $stmt->bindParam("timestampvalue", $timestamp);
    $stmt->execute();
    $id = $db->lastInsertId();
    $db = null;
    //echo json_encode($id);
    echo $image_url;
  } catch(PDOException $e) {
    echo '{"error":{"text":'. $e->getMessage() .'}}';
  }
}

function voteUser(){
  $id = $_POST["user_id"];
  $sql = "UPDATE Users SET `Votes` = `Votes` + 1 WHERE `ID` = :id";

  try{
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->bindParam("id", $id);
    $stmt->execute();
    echo "success";
  }catch(PDOException $e){
    echo '{"error":{"text":'. $e->getMessage() .'}}';
  }
}

function showHome()
{
  echo "string";
}

function getImage(){
  $path = $_GET["user_location"];
  $filePath = realpath(__DIR__ . '/..') . "/images/assets/headers/" . $path;
  //$filePath = __DIR__ . "/assets/headers/" . $path;

  header('Set-Cookie: fileDownload=true; path=/');
  header('Cache-Control: max-age=60, must-revalidate');
  //header("Content-type: text/csv");
  header('Content-Type:' . mime_content_type ($filePath));
  header('Content-Disposition: attachment; filename="'.basename($filePath).'"');
  header('Content-Length: ' . filesize($filePath));
  readfile($filePath);

  /*header('Content-Description: File Transfer');
  header('Content-Type: application/octet-stream');
  header('Content-Disposition: attachment;  filename="'.basename($filePath).'"');
  header('Expires: 0');
  header('Cache-Control: must-revalidate');
  header('Pragma: public');
  header('Content-Length: ' . filesize($filePath));
  readfile($filePath);*/
}

function addText($img_blob, $file_path, $name){

  $text = $name;
  $text_2 = "Rapper";
  $text_3 = "Like No Other";

  //$font =  realpath(__DIR__ . '/..') . "/fonts/MyriadPro-Bold/MyriadPro-Bold.ttf";
  $font =  realpath(__DIR__ . '/..') . "/fonts/DeFonarts/DeFonarts Bold_1.ttf";

  $black = imagecolorallocate($img_blob, 0, 0, 0);
  $white = imagecolorallocate($img_blob, 255, 255, 255);

  imagettftext($img_blob, 40, 0, 20, 640, $black, $font, $text);

  imagettftext($img_blob, 40, 0, 20, 700, $black, $font, $text_2);

  imagettftext($img_blob, 40, 0, 20, 760, $black, $font, $text_3);

  imagepng($img_blob, $file_path, 9);
}


function stitchImagesWithLogo($img_blob, $file_path){
  $logo = imagecreatefrompng(realpath(__DIR__ . '/..') . "/images/indomie.png");

  imagealphablending($logo, false);
  imagesavealpha($logo, true);

  imagecopy($img_blob, $logo, 20, 20, 0, 0, 150, 110);

  imagepng($img_blob, $file_path, 9);
}


function stitchImagesWithBg($img_blob, $file_path){
  $bg = imagecreatefrompng(realpath(__DIR__ . '/..') . "/images/bg.png");
  //imagealphablending($bg, false);
  //imagesavealpha($bg, true);

  list($max_width, $max_height) = getimagesize($file_path);

  //308, 171

  imagecopymerge($bg, $img_blob, 290, 150, 0, 0, $max_width, $max_height, 100);

  imagejpeg($bg, $file_path, 100);
}

function stitchImagesWithNameTag($img_blob_1, $img_blob_2, $file_path){
  $avatar = imagecreatefrompng(realpath(__DIR__ . '/..') . "/images/final.png");

  imagealphablending($avatar, false);
  imagesavealpha($avatar, true);

  imagecopy($avatar, $img_blob_1, 0, 0, 0, 0, 842, 808);

  //imagepng($avatar, $file_path, 9);

  imagecopy($avatar, $img_blob_2, 0, 808, 0, 0, 842, 200);

  imagepng($avatar, $file_path, 9);
}

function stitchImagesWithNameTagSecond(){
  $avatar = imagecreatefrompng(realpath(__DIR__ . '/..') . "/images/final.png");

  imagecopy($avatar, $img_blob_2, 843, 809, 0, 0, 842, 200);

  imagepng($avatar, $file_path, 9);
}

function stitchImagesWithAvatar($img_blob, $file_path){
  $avatar = imagecreatefrompng(realpath(__DIR__ . '/..') . "/images/friend_edited.png");

  imagealphablending($avatar, false);
  imagesavealpha($avatar, true);

  imagecopy($img_blob, $avatar, 0, 0, 0, 0, 842, 808);

  imagepng($img_blob, $file_path, 9);
}

function text($file_path){
  exec("bash " . __DIR__ . "/texteffect.sh -t 'some text' -s plain -e normal -f Arial -p 48 -c royalblue " . $file_path . " " .  $file_path);
}

function toon($file_path){
  exec("bash " . __DIR__ . "/toon.sh -m 1 -c pegtoplight " . $file_path . " " .  $file_path);
}

function crossHatch($file_path){
  exec("bash " . __DIR__ . "/crosshatch.sh -l 7 -s 20 -g 0 -a 1 " . $file_path . " " .  $file_path);
}

function daveHill($file_path){
  exec("bash " . __DIR__ . "/davehilleffect.sh " . $file_path . " " .  $file_path);
}

function cartoonImage($file_path, $pattern, $numlevels, $edgemethod, $edgeamount, $brightness, $saturation){
  exec("bash " . __DIR__ . "/cartoon.sh -p " . $pattern . " -n " . $numlevels . " -m " . $edgemethod . " -e " . $edgeamount . " -b " . $brightness . " -s " . $saturation . " " . $file_path . " " .  $file_path);
}

function uploadPicture()
{
  //$file_path = __DIR__ . "/assets/headers/";
  $file_path = realpath(__DIR__ . '/..') . "/images/assets/headers/";

  $name = $_POST["name"];
  $reason = $_POST["reason"];
  $x1 = $_POST["x1"];
  $y1 = $_POST["y1"];
  $x2 = $_POST["x2"];
  $y2 = $_POST["y2"];

  $w = $_POST["width"];
  $h = $_POST["height"];

  $date = new DateTime();
  $timestamp = $date->getTimestamp();



  $temp = explode(".", $_FILES["file"]["name"]);
  $newfilename = str_replace(" ", "", $name) . '.' . end($temp);

  $file_path = $file_path . $timestamp . $newfilename;//basename( $_FILES['file']['name']);
  if(move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
    list($max_width, $max_height) = getimagesize($file_path);

    //$im = @imagecreatefromjpeg($file_path);
    $info = pathinfo($file_path);
    $extension = strtolower($info['extension']);
    switch ($extension) {
        case 'jpg':
          $im = imagecreatefromjpeg($file_path);
          break;
        case 'jpeg':
          $im = imagecreatefromjpeg($file_path);
          break;
        case 'png':
          $im = imagecreatefrompng($file_path);
          break;
        case 'gif':
          $im = imagecreatefromgif($file_path);
          break;
        default:
          $im = imagecreatefromjpeg($file_path);
    }

    //we want to translate the points from the img element that this image is in, to the real size of the image
    /*$new_x1 = ($x1 * $max_width)/$w;
    $new_y1 = ($y1 * $max_height)/$h;

    $new_x2 = ($x2 * $max_width)/$w;
    $new_y2 = ($y2 * $max_height)/$h;



    $width = $new_x2 - $new_x1;
    $height = $new_y2 - $new_y1;*/

    $to_crop_array = array('x' => $x1 , 'y' => $y1, 'width' => $x2, 'height'=> $y2);
    $thumb_im = imagecrop($im, $to_crop_array);

    //imagefilter($thumb_im, IMG_FILTER_EDGEDETECT);
    //imagefilter($thumb_im, IMG_FILTER_PIXELATE, 3, 2);
    //imagefilter($thumb_im, IMG_FILTER_SMOOTH, 50);
    //imagefilter($thumb_im, IMG_FILTER_COLORIZE, 138, 100, 77, 200);

    imagejpeg($thumb_im, $file_path, 100);

    $size = getimagesize($file_path);
    $ratio = $size[0]/$size[1]; // width/height
    $width = 240;

    $new_height = ($size[1] * 240)/$size[0];

    $src = imagecreatefromstring(file_get_contents($file_path));
    $dst = imagecreatetruecolor($width, $new_height);

    imagecopyresampled($dst,$src, 0, 0, 0, 0, $width, $new_height, $size[0], $size[1]);
    imagepng($dst, $file_path);

    $thumb_im = imagecreatefromstring(file_get_contents($file_path));

    //add the white bg behind each image
    stitchImagesWithBg($thumb_im, $file_path);

    $final_im = $timestamp . $newfilename;

    cartoonImage($file_path, 70, 6, 1, 4, 100, 150);

    toon($file_path);

    //daveHill($file_path);

    //


    //crossHatch($file_path);

    //$imagick = new Imagick(realpath($file_path));
    //@$imagick->reduceNoiseImage(5);
    //$imagick->oilPaintImage(1);

    //$tint = new \ImagickPixel("rgb(138, 100, 77)");
    //$imagick->tintImage($tint, 255);
    //$imagick->writeImage($file_path);
    //file_put_contents ($final_im, $imagick);
    //illustrateImage($file_path);
    $new_img = imagecreatefromstring(file_get_contents($file_path));

    //add the image with the avatar
    stitchImagesWithAvatar($new_img, $file_path);
    stitchImagesWithLogo($new_img, $file_path);

    addText($new_img, $file_path, $name);

    /*$file_path_x = __DIR__  . "/yu.png";


    $im = @imagecreatetruecolor(842, 200);
    $black = imagecolorallocate($im, 0, 0, 0);
    $white = imagecolorallocate($im, 255, 255, 255);

    imagefilledrectangle($im, 0, 0, 399, 29, $black);

    $text = $name;
    $text_2 = "Rapper Like No Other";
    // Replace path by your own font path
    $font =  realpath(__DIR__ . '/..') . "/fonts/MyriadPro-Bold/MyriadPro-Bold.ttf";

    imagettftext($im, 40, 0, 10, 60, $white, $font, $text);

    imagettftext($im, 40, 0, 10, 120, $white, $font, $text_2);

    imagepng($im, $file_path_x);

    //imagedestroy($im);

    $new_img_final = imagecreatefromstring(file_get_contents($file_path));
    $second_new_img_final = imagecreatefromstring(file_get_contents($file_path_x));*/

    //stitchImagesWithNameTag($new_img_final, $im, $file_path);

    //addUser($name, $reason, $final_im, $timestamp);

    echo $final_im;

    //imagedestroy($im);
  } else{
      echo "fail";
  }
}
