FROM amazon/aws-lambda-nodejs:14

RUN yum -y install libpng-devel

RUN npm install --platform=linux --arch=x64 sharp

COPY index.js .

CMD ["index.handler"]

