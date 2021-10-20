# Overwatch Map Tracker

The idea of this project is to easily track which OW maps (QP/Comp) you get, and then analyze the frequency of each map occuring.

The UI is a simple web page that can be opened on your mobile device locally, and the server is a light express app to read/write the map log via a CSV file (`db.csv`).

## How to deploy

1. Clone the repo
1. Run `npm install`
1. Run `npm start`
1. Open the URL shown in console on your mobile device

## To Do

 - Analytics
 - Algorithm to divide logs into sessions for analytics
