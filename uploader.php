<?php
    // Codes created by nyoman piarsa
    // July 17, 2023
    //
    $img = file_get_contents("php://input");
    $path = "recorded";
    if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/" . $path)) {
        mkdir($_SERVER['DOCUMENT_ROOT'] . "/" . $path, 0777, true);
    }
    date_default_timezone_set('Asia/Makassar');
    $name = date('Y-m-d_H-i-s');      
    if($img){
        $filename = $name . '.jpg';
        $img = str_replace('data:image/jpeg;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        $success = file_put_contents($path.'/'.$filename, $data);
        echo 'recorded/'.$filename;
    }else if($_FILES['videoFile']){
        $filename = $name . '.mp4';
        move_uploaded_file($_FILES['videoFile']['tmp_name'], $path.'/'.$filename);
        echo 'recorded/'.$filename;
    }else{
        echo 0;
    }
