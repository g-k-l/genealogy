#!/bin/bash
# 1. Create build via `npm run-script build`
# 2. As the bucket owner, replace S3 bucket contents with new build
# 	`aws s3 rm s3://tic-tac-toe.gkliu.me/*`
# 	`aws s3 cp s3://tic-tac-toe.gkliu.me build/ --recursive`

# The following is an example of the server IAM user's
# permissions on the tic-tac-toe S3 bucket:
# {
#    "Version": "2012-10-17",
#    "Statement": [
#       {
#          "Sid": "statement1",
#          "Effect": "Allow",
#          "Principal": {
#             "AWS": "arn:aws:iam::AccountA-ID:user/Dave"
#          },
#          "Action": [
#             "s3:GetBucketLocation",
#             "s3:ListBucket"
#          ],
#          "Resource": [
#             "arn:aws:s3:::examplebucket"
#          ]
#       },
#       {
#          "Sid": "statement2",
#          "Effect": "Allow",
#          "Principal": {
#             "AWS": "arn:aws:iam::AccountA-ID:user/Dave"
#          },
#          "Action": [
#              "s3:GetObject"
#          ],
#          "Resource": [
#             "arn:aws:s3:::examplebucket/*"
#          ]
#       }
#    ]
# }

aws s3 rm s3://genealogy.gkliu.me --recursive
aws s3 cp client/ s3://genealogy.gkliu.me --recursive
