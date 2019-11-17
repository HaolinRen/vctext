import sys
import os
import csv
import json
from grouping import *
import sys
reload(sys)


sys.setdefaultencoding('utf-8')

MAX_SEARCH_PERSON = 8
MAX_SEARCH_RESULT = 400

class myTopicServer():
    def __init__(self):
        self.allData = []
        self.cop = copModularity()
            
    def formatter(self, data):
        self.allData = []
        self.dateDict = {}
        for onePiece in data:
            onePiece['text'] = onePiece['title'] + ' '
            onePiece['text'] += onePiece['content']
            for oneProp in onePiece['props']:
                onePiece['text'] += str(onePiece['props'][oneProp]) + ' '

            onePiece['topicsText'] = ''
            for oneTopic in onePiece['topics']:
                for oneVal in onePiece['topics'][oneTopic]:
                    onePiece['topicsText'] += oneVal + ' '
            onePiece['text'] += ' ' + onePiece['topicsText']

            if onePiece['date'] in self.dateDict:
              self.dateDict[onePiece['date']] += 1
            else:
              self.dateDict[onePiece['date']] = 1

            self.allData.append(onePiece)

    def loadData(self, config):
        try:
            with open(config['dataPath'], 'rb') as loadFile:
                data = json.load(loadFile)
                self.formatter(data)

            return self.dateDict
        except Exception as e:
            return False

    def checkCondition(self, oneData, cnd):
        isOk = True
        isFirst = True

        for oneCnd in cnd:
          isOneOk = True
          if 'startDate' in oneCnd:
            if oneCnd['startDate'] > oneData['date']:
              isOneOk = False
          if 'endDate' in oneCnd:
            if oneCnd['endDate'] < oneData['date']:
              isOneOk = False
          if 'keyword' in oneCnd:
            if oneCnd['keyword'] not in oneData['text']:
              isOneOk = False
          
          if oneCnd['condition'] == 'and':
            if isOk and isOneOk:
              isOk = True
            else:
              isOk = False
          elif oneCnd['condition'] == 'or':
            if isOk or isOneOk:
              isOk = True
            else:
              isOk = False
          elif oneCnd['condition'] == 'not':
            if not isOneOk and isOk:
              isOk = True
            else:
              isOk = False

        return isOk

    def analyseRequest(self, para):
        numberChecker = 0
        res = []
        for onePiece in self.allData:

            if numberChecker >= para['maxSnpNum']:
                break
            if self.checkCondition(onePiece, para['data']):
                temp = {}
                for oneProp in onePiece:
                    if oneProp != 'text' and oneProp != 'topicsText':
                        temp[oneProp] = onePiece[oneProp]

                res.append(temp)
                numberChecker += 1
        termsArr = self.cop.run(res, para['maxTermsNum'])
        return {
          'res': res,
          'terms': termsArr
        }



