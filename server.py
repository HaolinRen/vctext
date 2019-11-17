
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep, path
from urllib import unquote


from server.dataProcessor import dataProcessor
from server.topicServer import myTopicServer

import cgi

PORT_NUMBER = 8088

myts = myTopicServer()

class myHandler(BaseHTTPRequestHandler):

	#Handler for the GET requests
	def do_GET(self):
		if self.path=="/":
			self.path = "/client/index.html"
			# self.path = '/FaceCloud.html'
		try:
			#Check the file extension required and
			#set the right mime type
			sendReply = False

			# if '?' in self.path:
			# 	args = self.path.split('?')[1:]
			# 	self.path = self.path.split('?')[0]

			if self.path.endswith(".html"):
				mimetype='text/html'
				sendReply = True
			elif self.path.endswith(".jpg"):
				mimetype='image/jpg'
				self.path = unquote(self.path)
				sendReply = True
			elif self.path.endswith(".png"):
				mimetype='image/jpg'
				self.path = unquote(self.path)
				sendReply = True
			elif self.path.endswith(".gif"):
				mimetype='image/gif'
				sendReply = True
			elif self.path.endswith(".png"):
				mimetype='image/png'
				if not path.isfile(curdir + "/client" + self.path):
					self.path = "/data/thumbnails/default-topic.png"
				sendReply = True
			elif self.path.endswith(".js"):
				mimetype='application/javascript'
				sendReply = True
			elif self.path.endswith(".css"):
				mimetype='text/css'
				sendReply = True

			elif self.path.endswith(".eot"):
				mimetype = 'application/vnd.ms-fontobject'
				sendReply = True
			elif self.path.endswith(".otf"):
				mimetype = 'application/font-sfnt'
				sendReply = True
			elif self.path.endswith(".svg"):
				mimetype = 'image/svg+xml'
				sendReply = True
			elif self.path.endswith(".ttf"):
				mimetype = 'application/font-sfnt'
				sendReply = True
			elif self.path.endswith(".woff"):
				mimetype = 'application/font-woff'
				sendReply = True
			elif self.path.endswith(".woff2"):
				mimetype = 'application/font-woff2'
				sendReply = True
			elif self.path.endswith(".ico"):
				mimetype = 'image/x-icon'
				sendReply = True

			if sendReply == True:
				#Open the static file requested and send it
				f = open(curdir + self.path)
				self.send_response(200)
				self.send_header('Content-type',mimetype)
				self.end_headers()
				self.wfile.write(f.read())
				f.close()
			return

		except IOError:
			self.send_error(404,'File Not Found: %s' % self.path)

	#Handler for the POST requests
	def do_POST(self):
		try:
			ctype, pdict = cgi.parse_header(self.headers.getheader("Content-type"))	

			if ctype == "application/json":
				length = int(self.headers.getheader('content-length'))
				data = self.rfile.read(length)
				dp = dataProcessor(data)

				if self.path=="/get":
					dp.getEigValue()
				elif self.path == "/ben":
					para = dp.data
					dp.res = myts.analyseRequest(para)
				elif self.path == "/config":
					dp.res = myts.loadData(dp.data)
				rep = dp.getJsonData()
				self.send_response(200)
				self.end_headers()
				self.wfile.write(rep)
		except Exception as e:
			print e
			self.send_error(404, "bad request")
	
if __name__ == '__main__':
	try:
		#Create a web server and define the handler to manage the
		#incoming request
		server = HTTPServer(('', PORT_NUMBER), myHandler)
		print 'Started httpserver on port ' , PORT_NUMBER
		
		#Wait forever for incoming htto requests
		server.serve_forever()

	except KeyboardInterrupt:
		print '^C received, shutting down the web server'
		server.socket.close()




	