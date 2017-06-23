class DataFile < ActiveRecord::Base
  def self.save(upload)
    name =  upload['datafile'].original_filename
    directory = "public/data"
    # create the file path
    path = File.join(directory, name)
    # write the file
    File.open(path, "wb") { |f| f.write(upload['datafile'].read) }
  end

  def self.read(file_name)
  	directory = "public/data"
  	#Create the file path
  	path = File.join(directory,file_name)
  	#Read the file and parse it
  	rules = []
	text=File.open(path).read
	text.gsub!(/\r\n?/, "\n")
	text.each_line do |line|
	  rules.push(line)
	end
	return rules
  end
end