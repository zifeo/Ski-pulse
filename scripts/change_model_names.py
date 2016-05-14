#!/usr/bin/env python3

def get_name(name):
    parts = name.split(' ')
    assert(len(parts[0]) == 2)
    assert(len(parts[1]) == 4)
    parts = parts[2:]
    new_name = ''
    for p in parts:
        new_name = new_name + p + ' '
    new_name = new_name.strip()
    name = new_name
    name = name.replace("Tsoumaz", "tzoumaz");
    name = name.replace("TSK_Gentianes", "tsk-gentianes");
    name = name.replace("Gentianes", "tortin-gentianes");
    name = name.replace("Savoleyres", "savoleyres");
    name = name.replace("Mont-Gele", "mont-gele");
    name = name.replace("Mont-Fort", "mont-fort");
    name = name.replace("Moay", "moay");
    name = name.replace("Medran", "medran");
    name = name.replace("Moulins", "les-moulins");
    name = name.replace("SA Esserts", "les-esserts");
    name = name.replace("Attelas 1", "les-attelas");
    name = name.replace("Attelas 2", "funispace");
    name = name.replace("Tournelle", "le-tournelle");
    name = name.replace("Taillays", "le-taillay");
    name = name.replace("Sud", "le-sud");
    name = name.replace("Rouge", "le-rouge");
    name = name.replace("Nord", "le-nord");
    name = name.replace("Mayentzet", "le-mayentzet");
    name = name.replace("Lac des Vaux 3", "las-des-vaux-2");
    name = name.replace("Lac des Vaux 1", "las-des-vaux-1");
    name = name.replace("Pasay", "la-pasay");
    name = name.replace("Jumbo", "jumbo");
    name = name.replace("Etablons", "etablons");
    name = name.replace("Chaux Express/Rui Pi", "chaux-express-ruinettes");
    name = name.replace("Chaux Express/Rui", "chaux-express-ruinettes");
    name = name.replace("Chaux Express/Chx Piet", "chaux-express-chaux");
    name = name.replace("Chaux Express/Chx", "chaux-express-chaux");
    name = name.replace("Chaux 2", "chaux-2");
    name = name.replace("Chassoure", "chassoure");
    name = name.replace("Chables", "chable-verbier-depart");
    name = name.replace("La Cot", "chable-bruson");
    name = name.replace("Sortie Chab-Verb.", "verbier-le-chable");
    return name

def parse_line(line):
    fields = line.split(';')
    for i in range(0, len(fields)):
        fields[i] = fields[i].strip()
    n_entry = fields[0]
    id_pass = fields[1]
    if 'Grand-Tsay' in fields[2]:
        return None
    name = get_name(fields[2])
    date = fields[3]
    id_abo = fields[4]
    new_line = '{};{};{};{};{}'.format(n_entry, id_pass, name, date, id_abo)
    return new_line

def parse():
    input_file = open('../datasets/model.csv', 'r', encoding='ISO-8859-1')
    output_file = open('../datasets/model-parsed.csv', 'w', encoding='ISO-8859-1')
    
    line_count = 0
    for line in input_file:
        line_count += 1
        if line_count > 1:
            parsed = parse_line(line)
        else:
            parsed = line
            parsed = parsed.replace('\n', '')
        if parsed is not None:
            output_file.write(parsed + '\n')

if __name__ == '__main__':
    parse()
