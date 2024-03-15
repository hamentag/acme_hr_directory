**********************************Curl Test*************************************
__READ departments__
curl localhost:3000/api/departments

__READ employees__
curl localhost:3000/api/employees

 __CREATE__
curl localhost:3000/api/employees -X POST -d '{"name": "Hicham Bocha", "department_id": 1}' -H "Content-Type:application/json"

__UPDATE__
curl localhost:3000/api/employees/3 -X PUT -d '{"name": "Amjad Amentag", "department_id": 1}' -H "Content-Type:application/json"

__DELETE__
curl localhost:3000/api/employees/8 -X DELETE