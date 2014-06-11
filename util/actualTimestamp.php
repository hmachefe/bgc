<?php
  $date = new DateTime();

  // Javascript understands timestamp in milliseconds
  echo ($date->getTimestamp() * 1000);
?>
