#### New db format
----

###### App
----
~~~~
app
	app_id
	app_secret
	admin
	createdAt
~~~~

###### Document
----
~~~~
documents
	from:
	to:
	path
	file_hash
	tx_id
	filename
	status
~~~~

###### Messages
----
~~~~
messages
	from
	to
	content
	sentAt
	read
~~~~

###### Notifications
----
~~~~
notifications
	user
	messages
	label
~~~~

###### Tx
----
~~~~
tx
	filehash
	txid
	user	
	tx_date
	path
	filename
~~~~

###### Users
----
~~~~
users
	role
	uid
	phone
	email
	fullname
	keys
		key_name
		xpub
		xprv
	ect..
~~~~

###### Groups
----
~~~~
groups
	members
	admins
	createdAt
	xpub
	xprv
	group_name
	group_logo
~~~~


