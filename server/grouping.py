"""
{
'title': 'Dinosaura', 
'topics': {'director': ['Eric Leighton'], 
			'cast': ['Alfre Woodard', 'D.B. Sweeney', 'Della Reese'], 
			'genres': [u'Adventure', u'Animation', u'Family', u'Thriller'], 
			'keywords': [u'egg', u'iguanodon', u'lemur', u'meteor', u'nesting grounds']
			}, 
'content': u'story line', 
'link': u'http://www.imdb.com/title/tt0130623/?ref_=fn_tt_tt_1', 
'props': {
	'num_user_for_reviews': u'241', u'gross': u'137748063', u'num_voted_users': u'38438', u'cast_total_facebook_likes': u'2945', u'color': u'Color', u'budget': u'127500000', u'imdb_score': u'6.5', u'aspect_ratio': u'1.85'
	}, 
'date': u'2000'}, 
"""

class copModularity(object):

	def buildTermsGraph(self, data, termsFilter):
		graph = {
			'nodes': [],
			'links': []
		}

		nodesDict = {}
		linksDict = {}

		nodeIndex = 0
		linkIndex = 0
		
		for item in data:
			termsList = []
			for oneTopic in item['topics']:
				for topicVal in item['topics'][oneTopic]:
					if topicVal not in termsFilter:
						continue
					if topicVal not in termsList:
						termsList.append(topicVal)

			lgSize = len(termsList)
			for i in range(0, lgSize-1):
				term = termsList[i]
				if i == 0:
					if term not in nodesDict:
						nodesDict[term] = nodeIndex
						graph['nodes'].append({
								'term': term,
								'weight': 1
							})
						nodeIndex += 1
					else:
						graph['nodes'][nodesDict[term]]['weight'] += 1
				termIndex = nodesDict[term]
				for j in range(i+1, lgSize):
					term2 = termsList[j]
					if term2 not in nodesDict:
						nodesDict[term2] = nodeIndex
						graph['nodes'].append({
								'term': term2,
								'weight': 1
							})
						nodeIndex += 1
					else:
						graph['nodes'][nodesDict[term2]]['weight'] += 1
					term2Index = nodesDict[term2]

					linkChecker = str(termIndex) + '-' + str(term2Index)
					if termIndex > term2Index:
						linkChecker = str(term2Index) + '-' + str(termIndex)

					if linkChecker not in linksDict:
						linksDict[linkChecker] = linkIndex
						linkIndex += 1
						graph['links'].append({
								'source': termIndex,
								'target': term2Index,
								'weight': 1
							})
					else:
						graph['links'][linksDict[linkChecker]]['weight'] += 1

		return graph

	def buildTree(self, graph):
		initialGroups = {}

		nodesNum = len(graph['nodes'])
		for index in range(nodesNum):
			node = graph['nodes'][index]
			maxVal = 0
			if index in initialGroups:
				continue
			tempRoot = self.calMaxTermToGroup(graph, initialGroups, index)

			if tempRoot != False:
				node['root'] = tempRoot
				if tempRoot in initialGroups:
					initialGroups[tempRoot].append(index)
				else:
					initialGroups[tempRoot] = [index]
		return initialGroups

	def forceTermGroup(self, graph, groupRoot, members, childID):
		node = graph['nodes'][childID]

		if groupRoot in node['neighbors']:
			forceVal = node['neighbors'][groupRoot]
		else:
			forceVal = -graph['nodes'][childID]['force'] - graph['nodes'][groupRoot]['force']

		for oneMember in members:
			if oneMember == childID:
				continue
			if oneMember in node['neighbors']:
				forceVal += node['neighbors'][oneMember]*graph['nodes'][oneMember]['neighbors'][childID]
			else:
				forceVal -= (graph['nodes'][oneMember]['force'] + node['force'])

		return forceVal

	def calMaxTermToGroup(self, graph, groups, childID):
		ptg = False
		maxVal = False

		for nb in graph['nodes'][childID]['neighbors']:
			if nb not in groups:
				force = graph['nodes'][childID]['neighbors'][nb]
			else:
				force = self.forceTermGroup(graph, nb, groups[nb], childID)
			if force > maxVal or maxVal == False:
				maxVal = force
				ptg = nb
		return ptg

	def getMinGroup(self, groups):
		minVal = 0
		minGroup = 0
		for oneGroup in groups:
			if minVal == 0 or len(groups[oneGroup]) < minVal:
				minVal = len(groups[oneGroup])
				minGroup = oneGroup
		return oneGroup

	def mergeTwoGroups(self, groups, targetGroup, groupToMerge):
		groups[targetGroup].append(groupToMerge)
		for oneMember in groups[groupToMerge]:
			groups[targetGroup].append(oneMember)
		del groups[groupToMerge]

	def updateForceChecker(self, checker, groupToMerge, targetGroup):
		for root in checker:
			if root == groupToMerge:
				continue
			if root == targetGroup:
				for child in checker[root]:
					if child == groupToMerge:
						continue
					checker[root][child] += checker[groupToMerge][child]
				del checker[root][groupToMerge]
			else:
				checker[root][targetGroup] += checker[root][groupToMerge]
				del checker[root][groupToMerge]

	def pureTree(self, tree, graph):
		puredTree = {}
		for root in tree:
			if len(tree[root]) == 1:
				child = tree[root][0]
				if child in tree:
					if len(tree[child]) == 1 and tree[child][0] == root:
						if graph['nodes'][root]['weight'] < graph['nodes'][child]['weight']:
							continue

			tempList = []
			for child in tree[root]:
				if child not in tree:
					tempList.append(child)

			puredTree[root] = tempList
		return puredTree

	def reduceGroup(self, graph, groups, dgm):
		forceChecker = self.buildGroupForceChecker(graph, groups)

		while len(groups) > 1:
			minGroup = self.getMinGroup(groups)
			maxConnectedGroup = 0
			maxForce = False
			for oneGroup in groups:
				if oneGroup == minGroup:
					continue
				force = forceChecker[minGroup][oneGroup]
				if force > maxForce or maxForce == False:
					maxConnectedGroup = oneGroup
					maxForce = force

			if graph['nodes'][minGroup]['weight'] > graph['nodes'][maxConnectedGroup]['weight']:
				temp = minGroup
				minGroup = maxConnectedGroup
				maxConnectedGroup = temp

			graph['nodes'][minGroup]['root'] = maxConnectedGroup
			self.mergeTwoGroups(groups, maxConnectedGroup, minGroup)
			self.updateForceChecker(forceChecker, minGroup, maxConnectedGroup)
			dgm[maxConnectedGroup]['children'][minGroup] = 0

		for k in groups:
			dgm['root'] = k

	def calForceGroup2Group(self, gp1, gp2, groups, graph):

		forceVal = self.forceTermGroup(graph, gp2, groups[gp2], gp1)
		
		for oneMember in groups[gp1]:
			forceVal += self.forceTermGroup(graph, gp2, groups[gp2], oneMember)

		return forceVal

	def buildGroupForceChecker(self, graph, groups):
		forceChecker = {}

		for oneGroup in groups:
			if oneGroup not in forceChecker:
				forceChecker[oneGroup] = {}
			for TwoGroup in groups:
				if oneGroup != TwoGroup:
					if TwoGroup not in forceChecker:
						forceChecker[TwoGroup] = {}
					if TwoGroup not in forceChecker[oneGroup]:
						force = self.calForceGroup2Group(oneGroup, TwoGroup, groups, graph)
						forceChecker[oneGroup][TwoGroup] = force
					if oneGroup not in forceChecker[TwoGroup]:
						forceChecker[TwoGroup][oneGroup] = force

		return forceChecker

	def creatForce(self, graph):
		nodeSize = len(graph['nodes'])
		linkSize = len(graph['links'])
		for node in graph['nodes']:
			node['force'] = float(node['weight'])/nodeSize
			node['neighbors'] = {}
		for index in range(0, linkSize):
			link = graph['links'][index]
			if link['weight'] > 1:
				sourceNode = graph['nodes'][link['source']]
				targetNode = graph['nodes'][link['target']]
				sourceNode['neighbors'][link['target']] = float(link['weight'])/sourceNode['weight']
				targetNode['neighbors'][link['source']] = float(link['weight'])/targetNode['weight']

	def buildDendrogram(self, data):
		dendrogram = {}
		for root in data:
			dendrogram[root] = {
				'children': {}
			}
			for child in data[root]:
				dendrogram[root]['children'][child] = 0
		return dendrogram

	def getFrequencyTerms(self, data, termsNum):
		termsArr = []
		termsDict = {}
		for item in data:
			termsList = []
			for oneTopic in item['topics']:
				for topicVal in item['topics'][oneTopic]:
					if topicVal == '' or topicVal == ' ': 
						continue
					if topicVal in termsDict:
						termsDict[topicVal] += 1
					else:
						termsDict[topicVal] = 1

		for term in termsDict:
			if len(termsArr) == 0:
				termsArr.append({
						'text': term,
						'termIndex': termsDict[term]
					})
			else:
				k = len(termsArr)
				for index in range(k):
					if termsArr[index]['termIndex']  < termsDict[term]:
						termsArr.insert(index, {
								'text': term,
								'termIndex': termsDict[term]
							})
						if len(termsArr) >= termsNum:
							termsArr = termsArr[0:termsNum]
						break

		
		return termsArr

	def run(self, data, termsNum):

		termsFilter = self.getFrequencyTerms(data, termsNum)

		# graph = self.buildTermsGraph(data, termsFilter)

		# self.creatForce(graph)

		# igroups = self.buildTree(graph)

		# igroups = self.pureTree(igroups, graph)

		# dendrogram = self.buildDendrogram(igroups)

		# self.reduceGroup(graph, igroups, dendrogram)

		# return {
		# 	'dendrogram': dendrogram,
		# 	'graph': termsFilter
		# }
		return termsFilter
