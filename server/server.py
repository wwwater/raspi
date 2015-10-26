from BaseHTTPServer import BaseHTTPRequestHandler
from subprocess import call, Popen, PIPE
from os import curdir, sep, system
import json
import string
import urllib

class GetHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        
        try:
            if self.path == "/current":
                process = Popen("mpc", stdout = PIPE)
                self.sendResponseFromMpcInfo(process);       
                return 

            if self.path == "/playlists":
                process = Popen(["mpc", "lsplaylists"], stdout = PIPE)
                playlists = process.communicate()[0].split("\n")
                jsonObject = json.dumps(playlists)
                self.send_response(200)
                self.send_header('Content-type','application/json')
                self.end_headers()
                self.wfile.write(jsonObject)
                return


            # automatic requests
            if self.path == "/":
                self.path = "/index.html"
                sendReply = False

            if self.path.endswith(".html"):
                mimetype = "text/html"
                sendReply = True
            if self.path.endswith(".png"):
                mimetype = "image/png"
                sendReply = True
            if self.path.endswith(".ico"):
                mimetype = "image/ico"
                sendReply = True
            if self.path.endswith(".woff"):
                mimetype = "image/woff"
                sendReply = True
            if self.path.endswith(".ttf"):
                mimetype = "image/ttf"
                sendReply = True
            if self.path.endswith(".css"):
                mimetype = "text/css"
                sendReply = True
            if self.path.endswith(".js"):
                mimetype = "application/javascript"
                sendReply = True

                
            if sendReply == True:
                self.send_response(200)
                self.send_header("Content-type", mimetype)
                self.end_headers()
                f = open(curdir + sep + self.path)
                self.wfile.write(f.read())
                f.close()
            return
        except IOError:
            self.send_error(404, "Meow not found: %s" % self.path)

    def do_POST(self):
	
        if self.path.startswith("/playback"):
            path = self.path[10:]
            if path == "pause":
                process = Popen(["mpc", "toggle"], stdout = PIPE)
            elif path == "next":
                process = Popen(["mpc", "next"], stdout = PIPE)
            elif path == "previous":
                process = Popen(["mpc", "prev"], stdout = PIPE)
            elif path.startswith("volume"):
                path = path[7:]
                process = Popen(["mpc", "volume", path], stdout = PIPE)
            else:
                self.send_response(404)
                return
            self.sendResponseFromMpcInfo(process);       
            return
        
        if self.path.startswith("/sleep"):
            path = self.path[7:]
            try:
                params = path.split("/")
                until = params[0] or 90
                wakeup = params[1] or "6:30"
                system("bash /home/pi/zzz.sh " + until + " " + wakeup + " &")
            
            except:
                self.send_response(404)
                return
                
            self.send_response(200)
            self.send_header('Content-type','text/html')
            self.end_headers()
            return
        
        if self.path.startswith("/playlist"):
            try:
                playlist = urllib.unquote(self.path[10:]).decode("utf-8")
                process = Popen(["mpc", "clear"])
                process.wait()
                process = Popen(["mpc", "load", playlist])
                process.wait()
                process = Popen(["mpc", "play"], stdout = PIPE)
                self.sendResponseFromMpcInfo(process) 
                return
            except:
                self.send_response(404)
                return

    def sendResponseFromMpcInfo(self, process):
        info = process.communicate()[0].split("\n")
        song = info[0]
        secondsRemain = self.getSecondsRemain(info)
        volume = self.getVolume(info)
        jsonObject = json.dumps({
            "song": song, 
            "secondsRemain": secondsRemain,
            "volume": volume
        })
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        self.wfile.write(jsonObject);

    def getSecondsRemain(self, mpcInfo):
        if len(mpcInfo) > 1:
            secondLine = filter(lambda x: x is not "", mpcInfo[1].split(" "))
            print secondLine
            if secondLine and secondLine[0] == "[playing]" and len(secondLine) > 2:
                time = secondLine[2].split("/")
                if len(time) > 1:
                    timeElapsed = time[0]
                    timeTotal = time[1]
                    return (self.timeToSeconds(timeTotal) -
                            self.timeToSeconds(timeElapsed))
            else:
                return 10*60 # 10 min
        return None
        

    def timeToSeconds(self, time):
        time = time.split(":")
        if len(time) > 1:
            minuts = time[0]
            seconds = time[1]
            return int(seconds) + int(minuts)*60
        return 0

    def getVolume(self, mpcInfo):
        if len(mpcInfo) > 2:
            thirdLine = filter(lambda x: x is not "", mpcInfo[2].split(" "))
            if len(thirdLine) > 1:
                volume = string.strip(thirdLine[1], "%")
                return volume
        return 0        



if __name__ == '__main__':
    from BaseHTTPServer import HTTPServer
    try:
        server = HTTPServer(('192.168.1.23', 8000), GetHandler)
        print 'Starting server, use <Ctrl-C> to stop'
        server.serve_forever()
    except KeyboardInterrupt:
        print " --> Shutting down the meow server due to keyboard interrupting"
        server.socket.close()
