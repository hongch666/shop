from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

# 打开并读取 JSON 文件
with open('comment.json', 'r') as json_file:
    comment = json.load(json_file)
    
with open('history.json', 'r') as json_file:
    history = json.load(json_file)
    
with open('car.json', 'r') as json_file:
    car = json.load(json_file)
    
with open('collect.json', 'r') as json_file:
    collect = json.load(json_file)
    
with open('order.json', 'r') as json_file:
    order = json.load(json_file)

return_json=[]

for i in comment:
  data=i
  single={
      'user_id':data['user_id'],
      'action': 'Comment',
      'timestamp': datetime.now().isoformat(),
      'data':data,
      'create_time':data['create_time'],
      'update_time': data['update_time']
  }
  return_json.append(single)

for i in history:
  data=i
  single={
      'user_id':data['user_id'],
      'action': 'History',
      'timestamp': datetime.now().isoformat(),
      'data':data,
      'create_time':data['create_time'],
      'update_time': data['update_time']
  }
  return_json.append(single)

for i in car:
  data=i
  single={
      'user_id':data['user_id'],
      'action': 'Car',
      'timestamp': datetime.now().isoformat(),
      'data':data,
      'create_time':data['create_time'],
      'update_time': data['update_time']
  }
  return_json.append(single)

for i in collect:
  data=i
  single={
      'user_id':data['user_id'],
      'action': 'Collect',
      'timestamp': datetime.now().isoformat(),
      'data':data,
      'create_time':data['create_time'],
      'update_time': data['update_time']
  }
  return_json.append(single)

for i in order:
  data=i
  single={
      'user_id':data['user_id'],
      'action': 'Order',
      'timestamp': datetime.now().isoformat(),
      'data':data,
      'create_time':data['create_time'],
      'update_time': data['update_time']
  }
  return_json.append(single)

random.shuffle(return_json)

for i in range(len(return_json)):
  return_json[i]["id"]=i+1

    
# 导出为 JSON 文件
with open('action.json', 'w') as json_file:
    json.dump(return_json, json_file, indent=4)