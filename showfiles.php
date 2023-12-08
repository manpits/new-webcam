<?php
    $header = <<<DOC
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
    DOC;
    //
    $path    = './recorded';
    if(isset($_GET['d']) && $_GET['d']){
        unlink($path . "/" .$_GET['d']);
        header('Location: showfiles.php');
    }
    //
    echo $header;
    //
    $files = scandir($path);
    $files = array_diff(scandir($path), array('.', '..'));
    rsort($files);
    $row = "";
    $num = 0;
    foreach ($files as $file){
        if(substr($file,-4)=='.jpg' || substr($file,-4)=='.mp4'){
            $num++;
            $row .="<tr><td width='10%' align='center'>$num</td><td width='40%'><a href='recorded/$file'>$file</a></td><td align='right' width='20%'>".number_format(filesize($path . "/" . $file))."</td><td align='center'><a href='?d=$file'>Delete</a></td></tr>";
        }
    }
    //
    if($num>0){
        echo "<table><tr><th>No</th><th>Files</th><th>Size</th><th>Action</th></tr>$row</table>";
    }else{
        echo "No file(s) on server !";        
    }
    echo "</body>";
    echo "</html>";

