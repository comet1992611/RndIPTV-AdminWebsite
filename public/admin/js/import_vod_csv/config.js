
export default function (nga, admin) {
    var import_vod = admin.getEntity('import_vod');

    import_vod.creationView()
        .title('<h4>VOD <i class="fa fa-angle-right" aria-hidden="true"></i> Import VOD in CSV</h4>')
        .fields([
            nga.field('filename','file')
                .uploadInformation({ 'url': '/file-upload/single-file/temp/filename', 'accept': 'image/*, .csv, text/xml, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'apifilename': 'result', multiple: false})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.filename"></ma-file-field></div>'+
                    '<div class="col-xs-12 col-sm-1" style="display: none;"><img src="{{ entry.values.filename }}"/></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">Expected file types: csv</small></div>')
                .label('File input *'),

            nga.field('template')
                .label('')
                .template('<importvod_logs post="entry"></importvod_logs>')
        ]);

    return import_vod;

}