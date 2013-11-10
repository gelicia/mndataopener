require 'csv'
require 'open-uri'

CSV.foreach("dataURLS.csv") do |row|
	county = row[0]
	year = row[1]
	url = row[2]

	Dir.mkdir("../data/" + county) unless File.exists?("../data/" + county)

	File.open("../data/" + county + "/" + year + '-' + county + 'StudentSurvey.pdf', "wb") do |file|
		file.write open(url).read
		file.close
		end
	end