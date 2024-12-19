from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

def generate_random_comment():
    comment = {
        'product_id':random.randint(1,100000),
        'user_id': random.randint(1,20),
        'rating': random.randint(1,5),  # 随机价格，范围为 10 到 1000
        'comment': fake.sentence(nb_words=10),  # 随机生成的商品描述
        'create_time': datetime.now().isoformat(),
        'update_time': datetime.now().isoformat()
    }
    return comment

insert_list=[]

# 生成多个商品
for i in range(1000):
    insert_list.append(generate_random_comment())
    
# 导出为 JSON 文件
with open('comment.json', 'w') as json_file:
    json.dump(insert_list, json_file, indent=4)