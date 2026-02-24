step 1 -> create a database on mongodb atlas
step 2 -> create a cluster on mongodb atlas
step 3 -> create a database user on mongodb atlas
step 4 -> change the nework access and add ip 0.0.0.0 to allow access from anywhere
step 5 ->  go to cluster and click on connect and copy the connection string and replace the password with the password you created in step 3 and replace the database name with the name of your database
step 6 -> go to database acess and edit the password and autogenrate the password and copy 
step 7 -> download mongodb compass and connect to the database using the connection string to check if the connection is successful or not and also to check if the database is created or not and view the collections and documents in the database
step 8 -> the connection string will look like this mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority

