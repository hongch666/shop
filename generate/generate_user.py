from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

def generate_random_user(i):
    user = {
        'user_id':i,
        'username': fake.user_name(),
        'password': fake.password(),  # 随机价格，范围为 10 到 1000
        'email': fake.email(),  # 随机生成的商品描述
        'address': fake.address(),
        'create_time': datetime.now().isoformat(),
        'update_time': datetime.now().isoformat()
    }
    return user

insert_list=[]

# 生成多个商品
for i in range(20):
    insert_list.append(generate_random_user(i+1))
    
# 导出为 JSON 文件
with open('users.json', 'w') as json_file:
    json.dump(insert_list, json_file, indent=4)