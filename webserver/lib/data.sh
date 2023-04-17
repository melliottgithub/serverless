#!/bin/bash
sudo su

# Install packages
yum update -y
yum install -y httpd

# Start Apache web server
systemctl start httpd.service
systemctl enable httpd.service

# Create index.html file
echo "<html><body><h1>Welcome to my website!</h1></body></html>" > /var/www/html/index.html
