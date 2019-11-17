import numpy as np
import json

class dataProcessor(object):
	def __init__(self, arg):
		self.data = json.loads(arg)

	def getArr(self):
		arr = np.array(self.data)
		return arr

	def getEigValue(self):
		res = []
		try:
			arr = self.getArr()
			w, v = np.linalg.eig(arr)
			index = 0
			maxEig = 0
			for i in range(len(w)):
				if w[i].real > maxEig:
					index = i
					maxEig = w[i].real
			res.append(maxEig)
			tempList = []
			for x in v:
				tempList.append(abs(x[index].real))
			res.append(tempList)
		except:
			print 'compute error'
		self.res = res

	def getJsonData(self):
		try:
			res = json.dumps(self.res)
		except:
			res = "error"
		return res

	def loadJsonData(self, filePath):
		with open(filePath, 'rb') as loadFile:
			self.res = json.load(loadFile)

